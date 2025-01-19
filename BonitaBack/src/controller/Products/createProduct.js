const { Product, Image } = require('../../data');
const response = require('../../utils/response');

// Función para generar el próximo ID
const generateNextId = async () => {
  const lastProduct = await Product.findOne({
    order: [['createdAt', 'DESC']],
  });

  let nextId = 'B001'; // Valor por defecto si no hay productos.

  if (lastProduct) {
    const lastIdNum = parseInt(lastProduct.id_product.substring(1), 10); // Extrae el número y convierte a entero.
    const nextNum = lastIdNum + 1;
    nextId = `B${String(nextNum).padStart(3, '0')}`; // Formatea como B001, B002...
  }

  return nextId;
};

// Función para generar el código de barras
const generateBarcode = (fecha, sizes, colors, price, id_product) => {
  // Toma la parte entera del precio y extrae los miles o decenas de miles.
  const pricePart = Math.floor(price).toString();
  const significantPrice = pricePart.slice(0, pricePart.length - 3); // Extrae los miles.

  // Validamos que sizes y colors sean cadenas y les aplicamos toUpperCase solo si lo son.
  const sizesPart = sizes ? sizes.toString().toUpperCase() : 'DEFAULT';
  const colorsPart = colors ? colors.toString().toUpperCase() : 'DEFAULT';

  return `${fecha}${sizesPart}${colorsPart}${significantPrice}${id_product}`;
};


module.exports = async (req, res) => {
  console.log('Request body:', req.body)
  try {
    const {
      fecha,
      marca,
      description,
      codigoProv,
      price,
      priceSell,
      stock,
      sizes,
      colors,
      tax,
      isOffer,
      isDian,
      taxes_rate,
      unit,
      images,
    } = req.body;

    // Genera el próximo ID del producto
    const id_product = await generateNextId();

    // Genera el código de barras
    const codigoBarra = generateBarcode(fecha, sizes, colors, priceSell, id_product);

    // Crea el producto con las imágenes como array
    const product = await Product.create({
      id_product,
      codigoBarra,
      fecha,
      marca,
      description,
      codigoProv,
      price: parseFloat(price),
      priceSell: parseFloat(priceSell),
      stock: parseInt(stock, 10),
      sizes,
      colors,
      tax,
      isOffer,
      isDian,
      taxes_rate,
      unit,
      images, // Aquí se guarda el array de URLs de Cloudinary directamente
    });

    // Si necesitas guardar cada imagen como un registro en la tabla `Image`:
    if (images && images.length > 0) {
      const imagePromises = images.map((url) =>
        Image.create({
          id_product: product.id_product,
          url,
        })
      );

      await Promise.all(imagePromises);
    }

    return response(res, 201, { message: 'Product created successfully', product });
  } catch (error) {
    console.error('Error creando el producto:', error);
    return response(res, 500, { error: 'Error creating product' });
  }
};







