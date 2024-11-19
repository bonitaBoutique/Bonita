const { Product, Image } = require('../../data');
const response = require('../../utils/response');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../utils/cloudinaryConfig');

// Configuración de Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products',
    transformation: [
      { width: 300, height: 300, fit: 'scale' }
    ],
    format: async (req, file) => 'png',
    public_id: (req, file) => `${Date.now()}_${file.originalname.split('.')[0]}`,
  },
});

const upload = multer({ storage: storage });

module.exports = async (req, res) => {
  upload.array('images')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return response(res, 400, { error: 'Error uploading files.' });
    } else if (err) {
      console.error('Unknown error:', err);
      return response(res, 400, { error: err.message });
    }

    try {
      const {
        codigo,
        codigoBarra, 
        fecha,
        marca,
        description,
        codigoProv,
        price,
        stock,
        sizes,
        colors,
        isOffer,
      } = req.body;

      if (!codigo || !description || !price || !codigoBarra || !fecha || !marca || !codigoProv || !stock || !sizes || !colors ) {
        return response(res, 400, { error: 'Missing required fields' });
      }

      const images = req.files;

      const product = await Product.create({
        codigo,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        sizes: sizes,
        colors: colors,
        isOffer: isOffer === 'true' 
      });

      if (images && images.length > 0) {
        const imagePromises = images.map(async (image) => {
          const createdImage = await Image.create({
            codigo: product.codigo,
            url: image.path,
          });
          return createdImage;
        });

        await Promise.all(imagePromises);
      }

      console.log('Product with images created:', product);
      return response(res, 201, { product, images });
    } catch (error) {
      console.error('Error al crear producto con imagen:', error);
      return response(res, 500, { error: error.message });
    }
  });
};



