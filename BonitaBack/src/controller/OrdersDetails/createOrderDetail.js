
const { OrderDetail, Product } = require("../../data");
const response = require("../../utils/response");
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const secretoIntegridad = 'test_integrity_VMVZ36lyoQot5DsN0fBXAmp4onT5T86G'; 

function generarFirmaIntegridad(id_orderDetail, monto, moneda, secretoIntegridad) {
  const cadenaConcatenada = `${id_orderDetail}${monto}${moneda}${secretoIntegridad}`;
  return crypto.createHash('sha256').update(cadenaConcatenada).digest('hex');
}

module.exports = async (req, res) => {
  try {
    const { date, amount, quantity, state_order, id_product, address, deliveryAddress, n_document } = req.body;

    if (!date || !amount || !quantity || !state_order || !id_product || !address ) {
      return response(res, 400, { error: "Missing Ordering Data" });
    }
    if (address === 'Envio a domicilio' && !deliveryAddress) {
      return response(res, 400, { error: "Missing delivery address" });
    }

    const lastOrder = await OrderDetail.findOne({ order: [['createdAt', 'DESC']] });
    const lastOrderNumber = lastOrder ? lastOrder.id_orderDetail : 0;
    const referencia = `SO-${lastOrderNumber + 1}`;
    
    // Generar la firma de integridad
    const integritySignature = generarFirmaIntegridad(
      referencia,
      amount * 100, // Convertir el monto a centavos
      'COP',
      secretoIntegridad
    );

    const orderDetailData = {
     id_category: uuidv4(),
      date,
      amount,
      quantity,
      state_order,
      address,
      deliveryAddress: address === 'Envio a domicilio' ? deliveryAddress : null,
      n_document,
      integritySignature,
    };

    const orderDetail = await OrderDetail.create(orderDetailData);
    const productUpdates = id_product.map(productId => ({
      id_orderDetail: orderDetail.id_orderDetail,
      id_product: productId
    }));

    await Promise.all(productUpdates.map(async ({ id_orderDetail, id_product }) => {
      await Product.update({ id_orderDetail }, { where: { id_product } });
    }));

    const updatedOrderDetail = await OrderDetail.findOne({
      where: { id_orderDetail: orderDetail.id_orderDetail },
      include: {
        model: Product,
        as: 'products',
        attributes: ['id_product'],
      }
    });
    console.log("Order created:", updatedOrderDetail);
    console.log("Order created:", orderDetail);
    return response(res, 201, { orderDetail });
  } catch (error) {
    console.error("Error creating orderDetail:", error);
    return response(res, 500, { error: error.message });
  }
};
