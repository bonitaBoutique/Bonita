// controllers/getAllCategories.js
const { SubCategory } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll();
    return response(res, 200, { subCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return response(res, 500, { error: error.message });
  }
};
