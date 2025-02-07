const xlsx = require('xlsx');
const path = require('path');
const { createProduct } = require('../controller'); // Adjust the path as needed

const loadProductsFromExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const products = xlsx.utils.sheet_to_json(sheet);

    for (const product of products) {
      const {
        fecha = "010225", // Provide default value
        sizes = 'DEFAULT', // Provide default value
        colors = 'DEFAULT', // Provide default value
        description,
        price,
        id_product,
        codigoBarra, 
        priceSell,
        stock = 0 // Provide default value for stock
      } = product;

      const productData = {
        fecha,
        sizes,
        colors,
        description,
        price,
        id_product, // Use id_product from Excel
        codigoBarra, // Barcode from Excel
        priceSell,
        stock: isNaN(stock) ? 0 : parseInt(stock, 10), // Ensure stock is an integer
        // Add other necessary fields
      };

      await createProduct({ body: productData }, { status: () => ({ json: () => {} }) });
    }

    console.log('Products loaded successfully');
  } catch (error) {
    console.error('Error loading products:', error);
  }
};

const filePath = path.join(__dirname, '../utils/products.xlsx'); // Adjust the path to your Excel file
loadProductsFromExcel(filePath);