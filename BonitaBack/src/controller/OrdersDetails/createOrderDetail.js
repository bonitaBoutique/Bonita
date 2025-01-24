
const { OrderDetail, Product, StockMovement } = require("../../data");
const response = require("../../utils/response");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const secretoIntegridad = "test_integrity_VMVZ36lyoQot5DsN0fBXAmp4onT5T86G";

function generarFirmaIntegridad(id_orderDetail, monto, moneda, secretoIntegridad) {
  const cadenaConcatenada = `${id_orderDetail}${monto}${moneda}${secretoIntegridad}`;
  return crypto.createHash("sha256").update(cadenaConcatenada).digest("hex");
}

module.exports = async (req, res) => {
  try {
    const { date, amount, quantity, state_order, pointOfSale, id_product, address, deliveryAddress, n_document } = req.body;

    if (!date || !amount || !quantity || !state_order || !id_product || !address) {
      return response(res, 400, { error: "Missing Ordering Data" });
    }
    if (address === "Envio a domicilio" && !deliveryAddress) {
      return response(res, 400, { error: "Missing delivery address" });
    }

    // Verificar el stock de los productos
    const products = await Product.findAll({
      where: { id_product: id_product },
      attributes: ["id_product", "stock", 'isDian'],
    });

    const productosSinStock = products.filter((product) => {
      const ordenCantidad = id_product.filter((id) => id === product.id_product).length;
      return product.stock < ordenCantidad;
    });

    if (productosSinStock.length > 0) {
      return response(res, 400, { error: "Not enough stock for some products", productosSinStock });
    }

    // Generar la firma de integridad
    const referencia = `SO-${uuidv4()}`;
    const integritySignature = generarFirmaIntegridad(referencia, amount * 100, "COP", secretoIntegridad);
    const isFacturable = products.some(product => product.isDian);

    // Crear la orden
    const orderDetail = await OrderDetail.create({
      id_orderDetail: uuidv4(),
      date,
      amount,
      quantity,
      state_order,
      address,
      deliveryAddress: address === "Envio a domicilio" ? deliveryAddress : null,
      n_document,
      isFacturable,
      pointOfSale,
      integritySignature,
    });

    // Asociar productos a la orden y registrar movimiento de stock
    await Promise.all(
      id_product.map(async (productId) => {
        const cantidadSalida = id_product.filter((id) => id === productId).length;

        // Registrar movimiento de stock
        await StockMovement.create({
          id_movement: uuidv4(),
          id_product: productId,
          type: "OUT",
          quantity: cantidadSalida,
        });

        // Actualizar el stock del producto
        await Product.decrement("stock", {
          by: cantidadSalida,
          where: { id_product: productId },
        });

        await orderDetail.addProduct(productId, { through: { quantity: cantidadSalida } });
  })
);

    // Incluir productos en la respuesta final
    const updatedOrderDetail = await OrderDetail.findOne({
      where: { id_orderDetail: orderDetail.id_orderDetail },
      include: {
        model: Product,
        as: "products",
        attributes: ["id_product", "stock"],
      },
    });

    console.log("Orden creada:", updatedOrderDetail);
    return response(res, 201, { orderDetail: updatedOrderDetail });
  } catch (error) {
    console.error("Error creating orderDetail:", error);
    return response(res, 500, { error: error.message });
  }
};
