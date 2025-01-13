const { Expense } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await Expense.findByPk(id);

    if (!expense) {
      return response(res, 404, { error: "Expense not found" });
    }

    await expense.destroy();
    console.log('Expense deleted:', expense); // Log para verificar en la consola del servidor
    return response(res, 200, { message: "Expense deleted successfully" });
  } catch (error) {
    console.error('Error deleting expense:', error); // Log del error para depuración
    return response(res, 500, { error: error.message });
  }
};

