const { Product } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  const { id } = req.params;
  const { marca, description, price, priceSell, stock, sizes, colors, tiendaOnLine } = req.body;

  if (!marca && !description && !price && !stock && !priceSell  && !sizes && !colors   && tiendaOnLine === undefined) {
    return response(res, 400, { error: "No data to update" });
  }

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return response(res, 404, { error: "Product not found" });
    }

    // Actualizar los campos del producto
    product.marca = marca !== undefined ? marca : product.marca;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? parseFloat(price) : product.price;
    product.stock = stock !== undefined ? parseInt(stock, 10) : product.stock;
    product.priceSell = priceSell !== undefined ? parseFloat(priceSell) : product.priceSell;
    product.tiendaOnLine = tiendaOnLine !== undefined ? JSON.parse(tiendaOnLine) : product.tiendaOnLine;
    product.sizes = sizes !== undefined ? sizes : product.sizes;
    product.colors = colors !== undefined ? colors : product.colors;


    // Guardar los cambios en la base de datos
    await product.save();
    console.log('Product updated:', product);

    return response(res, 200, { message: "Product updated successfully", product });
  } catch (error) {
    console.error('Error updating product:', error);
    return response(res, 500, { error: error.message });
  }
};


