const { OrderDetail, Product, StockMovement, OrderProduct } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { id_orderDetail, id_product } = req.body;

  try {
    // Busca la relación en la tabla intermedia
    const orderProduct = await OrderProduct.findOne({
      where: { id_orderDetail, id_product }
    });
    if (!orderProduct) return response(res, 404, "Producto no encontrado en la orden");

    const quantityToReturn = orderProduct.quantity;

    // Quitar el producto de la orden
    await orderProduct.destroy();

    // Actualizar el stock del producto
    const product = await Product.findByPk(id_product);
    product.stock += quantityToReturn;
    await product.save();

    // Registrar el movimiento de stock
    await StockMovement.create({
        id_product,
        type: "IN", // ✅ Valor permitido por el ENUM
        quantity: quantityToReturn,
        description: `Devolución por eliminación de producto en orden ${id_orderDetail}`
      });
    // Recalcular monto y cantidad de la orden
    const order = await OrderDetail.findByPk(id_orderDetail, {
      include: { model: Product, as: "products" }
    });

    let newAmount = 0;
    let newQuantity = 0;
    const products = await order.getProducts();
    for (const prod of products) {
      const through = prod.OrderProduct;
      newAmount += through.quantity * prod.price;
      newQuantity += through.quantity;
    }

    order.amount = newAmount;
    order.quantity = newQuantity;
    await order.save();

    return response(res, 200, "Producto eliminado de la orden, stock actualizado y monto recalculado");
  } catch (error) {
    return response(res, 500, error.message);
  }
};