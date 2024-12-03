const { Product, StockMovement } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { id_product } = req.params;

    if (!id_product) {
      return response(res, 400, { error: "Missing product ID" });
    }

    // Buscar el producto y sus movimientos de stock
    const product = await Product.findOne({
      where: { id_product },
      attributes: ["id_product", "codigoBarra", "stock"], // Ajusta los campos según tus necesidades
      include: {
        model: StockMovement,
        attributes: ["id_movement", "type", "quantity", "date"],
        order: [["date", "DESC"]], // Ordenar por fecha descendente para ver los últimos movimientos primero
      },
    });

    if (!product) {
      return response(res, 404, { error: "Product not found" });
    }

    return response(res, 200, {
      id_product: product.id_product,
      codigoBarra: product.codigoBarra,
      stock: product.stock,
      movements: product.StockMovements, // Historial de movimientos
    });
  } catch (error) {
    console.error("Error fetching product stock:", error);
    return response(res, 500, { error: error.message });
  }
};
