const { Category } = require('../../data');
const response = require('../../utils/response');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  try {
    const { name_category } = req.body;

    if (!name_category) {
      return response(res, 400, { error: "nombre requerido" });
    }
    
     const existingCategory = await Category.findOne({ where: { name_category } });

     if (existingCategory) {
       return response(res, 400, { error: "Ya existe esta categoría" });
     }
 

    const categoryData = {
      id_category: uuidv4(), 
      name_category
    };

    const category = await Category.create(categoryData);

    console.log('Categoría creada:', category);
    return response(res, 201, { category });
  } catch (error) {
    console.error('Error :', error);
    return response(res, 500, { error: error.message });
  }
};

