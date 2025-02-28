const fs = require('fs');
const { Product } = require('../src/data'); // Ajusta la ruta al modelo Product
const { conn } = require('../src/data'); // Importa la instancia de Sequelize

const loadProducts = async () => {
  try {
    // Lee el archivo productos.json
    const productsData = fs.readFileSync('C:/Users/yaniz/Documents/Bonita/Bonita/BonitaBack/productos.json', 'utf8'); // Ajusta la ruta al archivo JSON
    const products = JSON.parse(productsData);

    // Inicia una transacción para asegurar la atomicidad
    await conn.transaction(async (t) => {
      // Itera sobre los productos y crea cada uno en la base de datos
      for (const productData of products) {
        // Crea el producto
        await Product.create(productData, { transaction: t });
      }
    });

    console.log('Todos los productos han sido cargados exitosamente.');
  } catch (error) {
    console.error('Error al cargar los productos:', error);
  }
};

// Ejecuta la función de carga
loadProducts();
