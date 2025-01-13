const xlsx = require('xlsx');
const path = require('path');
require('dotenv').config();

const { Product } = require('./src/data'); // Asegúrate de importar correctamente tu modelo

// Ruta al archivo Excel
const excelFilePath = path.join(__dirname, 'inventario.xlsx');

// Función para leer y convertir el Excel a JSON
const loadProductsFromExcel = () => {
  const workbook = xlsx.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0]; // Lee la primera hoja
  const sheet = workbook.Sheets[sheetName];
  const products = xlsx.utils.sheet_to_json(sheet); // Convierte la hoja en un array de objetos
  return products;
};

// Función para guardar los productos en la base de datos
const saveExistingProducts = async () => {
  const products = loadProductsFromExcel();

  for (const product of products) {
    const { id_product, fecha, codigoBarra, marca, description, price, priceSell, stock, sizes, colors, tax, unit} = product;

    // Verifica si el producto ya existe
    const existingProduct = await Product.findOne({ where: { id_product } });
    if (!existingProduct) {
      await Product.create({
        id_product,
        fecha,
        codigoBarra,
        marca,
        description,
        price: parseFloat(price),
        priceSell: parseFloat(priceSell),
        stock: parseInt(stock, 10),
        sizes,
        colors,
        tax,
        unit,
      });
      console.log(`Producto con ID ${id_product} cargado.`);
    } else {
      console.log(`El producto con ID ${id_product} ya existe.`);
    }
  }
};

// Ejecuta la función para cargar productos
saveExistingProducts()
  .then(() => console.log('Carga de productos completa.'))
  .catch((err) => console.error('Error al cargar productos:', err));
