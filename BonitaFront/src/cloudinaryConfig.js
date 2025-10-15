

const cloudinaryConfig = {
  cloudName: 'dikg5d5ih',
  uploadPreset: 'ecommerce-products'
};

export const openCloudinaryWidget = (callback, options = {}) => {
  const cloudinaryWidget = window.cloudinary.createUploadWidget(
    {
      cloudName: cloudinaryConfig.cloudName,
      uploadPreset: cloudinaryConfig.uploadPreset,
      multiple: options.multiple !== undefined ? options.multiple : true,
      folder: options.folder || 'packs',
      resourceType: options.resourceType || 'image', // Solo imágenes por defecto
      clientAllowedFormats: options.formats || ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      maxFileSize: options.maxFileSize || 10000000, // 10MB por defecto
    },
    (error, result) => {
      if (error) {
        console.error('Error en Cloudinary:', error);
      }
      if (result.event === 'success') {
        callback(result.info.secure_url, result.info.public_id);  
      }
    }
  );
  cloudinaryWidget.open();
};



