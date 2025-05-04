const { Expense } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    // Asegúrate de que 'destinatario' venga en req.body desde el frontend
    const { date, type, description, paymentMethods, amount, destinatario } = req.body;

    // Validación básica (puedes agregar más según necesites)
    if (!date || !type || !paymentMethods || !amount) {
       return response(res, 400, 'Faltan campos obligatorios (date, type, paymentMethods, amount)');
    }

    const newExpense = await Expense.create({
        date: new Date(),
        type,
        description,
        paymentMethods,
        amount,
        destinatario // <-- Se pasa el destinatario al crear
    });

    response(res, 201, { message: 'Gasto creado con éxito', newExpense });
  }
  catch (error) {
    console.error('Error al crear el gasto:', error);
    // Devuelve un mensaje de error más específico si es posible
    response(res, 500, `Error al crear el gasto: ${error.message}`);
  }
}
