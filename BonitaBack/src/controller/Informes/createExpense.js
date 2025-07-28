const { Expense } = require('../../data');
const response = require('../../utils/response');
const { formatDateForDB } = require('../../utils/dateUtils'); // ✅ Importa tu utilitario

module.exports = async (req, res) => {
  try {
    const { date, type, description, paymentMethods, amount, destinatario } = req.body;

    if (!date || !type || !paymentMethods || !amount) {
      return response(res, 400, 'Faltan campos obligatorios (date, type, paymentMethods, amount)');
    }

    // ✅ Asegura que la fecha sea en zona horaria de Colombia
    const dateColombia = formatDateForDB(date);

    const newExpense = await Expense.create({
      date: dateColombia,
      type,
      description,
      paymentMethods,
      amount,
      destinatario
    });

    response(res, 201, { message: 'Gasto creado con éxito', newExpense });
  }
  catch (error) {
    console.error('Error al crear el gasto:', error);
    response(res, 500, `Error al crear el gasto: ${error.message}`);
  }
}