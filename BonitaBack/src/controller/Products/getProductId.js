const { Product, Image } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  const { id_product } = req.params;

  try {
    // Buscar el producto por su ID, incluyendo las imágenes asociadas
    const product = await Product.findByPk(id_product, {
      include: [
        {
          model: Image,  // Incluir las imágenes asociadas al producto
        }
      ],
    });

    // Si no se encuentra el producto, retornar un error 404
    if (!product) {
      return response(res, 404, { error: "Product not found" });
    }

    // Retornar el producto encontrado
    return response(res, 200, { product });

  } catch (error) {
    console.error('Error fetching product:', error);
    return response(res, 500, { error: error.message });
  }
};

