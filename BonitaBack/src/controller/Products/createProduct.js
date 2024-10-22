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
        name,
        description,
        price,
        stock,
        id_category,
        id_SB,
        sizes,
        colors,
        materials,
        section,
        isOffer 
      } = req.body;

      if (!name || !description || !price) {
        return response(res, 400, { error: 'Missing required fields' });
      }

      const images = req.files;

      const product = await Product.create({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        id_category,
        id_SB,
        sizes: sizes ? JSON.parse(sizes) : null,
        colors: colors ? JSON.parse(colors) : null,
        materials: materials ?JSON.parse(materials): null,
        section,
        isOffer: isOffer === 'true' 
      });

      if (images && images.length > 0) {
        const imagePromises = images.map(async (image) => {
          const createdImage = await Image.create({
            id_product: product.id_product,
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



