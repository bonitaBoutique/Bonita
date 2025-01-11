const { Expense } = require('../../data');
const response = require('../../utils/response');


 
module.exports = async (req, res) => {
  try {
    const expense = req.body;
    const newExpense = await Expense.create(expense);

    response(res, 201, { message: 'Gasto creado con éxito', newExpense });
  }
  catch (error) {
    console.error(error);
    response(res, 500, 'Error al crear el gasto');
  }
}
