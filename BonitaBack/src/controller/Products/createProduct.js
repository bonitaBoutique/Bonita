const { Product, Image } = require('../../data');
const response = require('../../utils/response');

// Función para generar el próximo ID

const generateNextId = async () => {
  try {
    let nextId = 'B001';
    let idExists = true;
    let counter = 0; // Add a counter to prevent infinite loops

    while (idExists && counter < 1000) { // Limit the loop to 1000 iterations
      const lastProduct = await Product.findOne({
        order: [['createdAt', 'DESC']],
      });

      if (lastProduct) {
        const lastIdNum = parseInt(lastProduct.id_product.substring(1), 10);
        const nextNum = lastIdNum + 1;
        const numDigits = String(nextNum).length; // Determine the number of digits
        nextId = `B${String(nextNum).padStart(numDigits < 3 ? 3 : numDigits, '0')}`; // Adjust padding
      }

      // Check if the generated ID already exists
      const existingProduct = await Product.findOne({
        where: {
          id_product: nextId,
        },
      });

      if (!existingProduct) {
        // If the ID doesn't exist, exit the loop
        idExists = false;
      } else {
        // If the ID exists, generate a new one
        console.log(`ID ${nextId} already exists, generating a new one`);
      }
      counter++; // Increment the counter
    }

    if (counter >= 1800) {
      console.error('Exceeded maximum ID generation attempts.');
      throw new Error('Could not generate a unique ID.');
    }

    return nextId;
  } catch (error) {
    console.error('Error generating next ID:', error);
    throw error;
  }
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
      
      codigoBarra,
    } = req.body;

    // Genera el próximo ID del producto
    const id_product = await generateNextId();

    // Genera el código de barras
    const barcode = codigoBarra || generateBarcode(fecha, sizes, colors, price, id_product);

    // Crea el producto con las imágenes como array
    const product = await Product.create({
      id_product,
      codigoBarra,
      fecha,
      marca,
      description,
      id_product,
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
      codigoBarra: barcode,
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







