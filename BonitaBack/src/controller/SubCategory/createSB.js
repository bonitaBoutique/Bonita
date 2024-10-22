const { SubCategory } = require('../../data');
const response = require('../../utils/response');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  try {
    const { name_SB } = req.body;

    if (!name_SB) {
      return response(res, 400, { error: "nombre requerido" });
    }
    
     const existingSB = await SubCategory.findOne({ where: { name_SB } });

     if (existingSB) {
       return response(res, 400, { error: "Ya existe esta categoría" });
     }
 

    const SBData = {
      id_SB: uuidv4(), 
      name_SB
    };

    const subcategory = await SubCategory.create(SBData);

    console.log('Categoría creada:', subcategory);
    return response(res, 201, { subcategory});
  } catch (error) {
    console.error('Error :', error);
    return response(res, 500, { error: error.message });
  }
};

