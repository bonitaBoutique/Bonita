const { Expense } = require('../../data');
const response = require('../../utils/response');
const { formatDateForDB, getColombiaDate } = require('../../utils/dateUtils'); // ✅ IMPORTAR getColombiaDate

module.exports = async (req, res) => {
  try {
    // ✅ OBTENER FECHA DEL SERVIDOR (igual que en recibos)
    const serverDate = getColombiaDate();
    
    const { date, type, description, paymentMethods, amount, destinatario } = req.body;

    // ✅ LOGS DE FECHA (para debugging)
    console.log('🕒 [CREATE EXPENSE] Fecha del cliente:', date);
    console.log('🕒 [CREATE EXPENSE] Fecha del servidor (Colombia):', serverDate);

    if (!type || !paymentMethods || !amount) {
      return response(res, 400, 'Faltan campos obligatorios (type, paymentMethods, amount)');
    }

    const newExpense = await Expense.create({
      date: formatDateForDB(serverDate), // ✅ Usar fecha del servidor, no del cliente
      type,
      description,
      paymentMethods,
      amount,
      destinatario
    });

    console.log('🟢 [CREATE EXPENSE] Gasto creado con fecha del servidor:', serverDate);

    response(res, 201, { 
      message: 'Gasto creado con éxito', 
      newExpense,
      serverInfo: {
        clientDate: date,
        serverDate: serverDate,
        timezone: 'America/Bogota'
      }
    });
  }
  catch (error) {
    console.error('❌ [CREATE EXPENSE] Error al crear el gasto:', error);
    response(res, 500, `Error al crear el gasto: ${error.message}`);
  }
}