const { Product } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return response(res, 404, { error: "Product not found" });
    }

    await product.destroy();
    console.log('Product deleted:', product); // Log para verificar en la consola del servidor
    return response(res, 200, { message: "Product deleted successfully" });
  } catch (error) {
    console.error('Error deleting product:', error); // Log del error para depuración
    return response(res, 500, { error: error.message });
  }
};

