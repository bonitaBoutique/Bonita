// controllers/getAllCategories.js
const { Category } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const categories = await Category.findAll();
    return response(res, 200, { categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return response(res, 500, { error: error.message });
  }
};
