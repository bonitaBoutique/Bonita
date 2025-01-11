const { Expense } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar el producto por su ID, incluyendo las imágenes asociadas
    const expense = await Expense.findByPk(id, {
     
    });

    // Si no se encuentra el producto, retornar un error 404
    if (!expense) {
      return response(res, 404, { error: "Expense not found" });
    }

    // Retornar el producto encontrado
    return response(res, 200, { expense });

  } catch (error) {
    console.error('Error fetching expense:', error);
    return response(res, 500, { error: error.message });
  }
};

