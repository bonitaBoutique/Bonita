const { OrderDetail, Product } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const { id_orderDetail } = req.params;

    if (!id_orderDetail) {
      return response(res, 400, { error: "No se proporcionó el id_orderDetail." });
    }

    const order = await OrderDetail.findOne({
      where: { id_orderDetail },
      include: {
        model: Product,
        as: 'products',
        attributes: ['id_product', 'codigoBarra', 'price', 'priceSell', 'description'], // Incluye los campos adicionales
      },
    });

    if (!order) {
      return response(res, 404, { error: "Orden no encontrada." });
    }

    const formattedOrder = {
      id_orderDetail: order.id_orderDetail,
      date: order.date,
      amount: order.amount,
      quantity: order.quantity,
      state_order: order.state_order,
      address: order.address,
      deliveryAddress: order.deliveryAddress,
      n_document: order.n_document,
      products: order.products.map(product => ({
        id_product: product.id_product,
        codigoBarra: product.codigoBarra,
        price: product.price,
        priceSell: product.priceSell,
        description: product.description,
      })),
      integritySignature: order.integritySignature,
      trackingNumber: order.trackingNumber,
    };

    return response(res, 200, { orderDetail: formattedOrder });
  } catch (error) {
    console.error('Error fetching order:', error);
    return response(res, 500, { error: error.message });
  }
};




