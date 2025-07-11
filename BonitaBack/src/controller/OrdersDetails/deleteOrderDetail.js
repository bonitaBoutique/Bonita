const { OrderDetail, Product, StockMovement } = require("../../data");
const response = require("../../utils/response");
const { v4: uuidv4 } = require("uuid");

module.exports = async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE request received for order ID: ${req.params.id}`);
  try {
    const orderDetailToDelete = await OrderDetail.findOne({
      where: { id_orderDetail: id },
      include: {
        model: Product,
        as: "products",
        through: {
          attributes: ["quantity"],
        },
      },
    });

    if (!orderDetailToDelete) {
      return response(res, 404, { error: "Order detail not found" });
    }

    if (orderDetailToDelete.products && orderDetailToDelete.products.length > 0) {
      for (const product of orderDetailToDelete.products) {
        // --- DEBUGGING: Imprime la estructura del objeto product ---
        console.log("Inspecting product object:", JSON.stringify(product, null, 2));
        // ---------------------------------------------------------

        // Esta línea causa el error, necesitamos ver dónde está 'quantity' en el log de arriba
        const quantityToRestore = product.OrderProduct.quantity;// <-- El problema está aquí

        if (typeof quantityToRestore !== 'number' || isNaN(quantityToRestore)) {
            console.warn(`Cantidad inválida para producto ${product.id_product} en orden ${id}. Saltando restauración.`);
            continue;
        }

        await StockMovement.create({
          id_movement: uuidv4(),
          id_product: product.id_product,
          type: "IN",
          quantity: quantityToRestore,
          description: `Restauración por eliminación de orden ${id}`,
        });

        await Product.increment("stock", {
          by: quantityToRestore,
          where: { id_product: product.id_product },
        });

        console.log(`Stock restaurado para producto ${product.id_product}: +${quantityToRestore}`);
      }
    }

    await orderDetailToDelete.destroy();

    console.log(`Order detail ${id} deleted successfully.`);
    return response(res, 204, null);

  } catch (error) {
    console.error("Error deleting orderDetail:", error);
    return response(res, 500, { error: `Error deleting order detail: ${error.message}` });
  }
};