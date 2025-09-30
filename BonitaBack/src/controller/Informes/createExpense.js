const { Expense } = require('../../data');
const response = require('../../utils/response');
const { formatDateForDB, getColombiaDate } = require('../../utils/dateUtils'); // ✅ IMPORTAR getColombiaDate

module.exports = async (req, res) => {
  try {
    const { date, type, description, paymentMethods, amount, destinatario } = req.body;

    // ✅ LOGS DE FECHA (para debugging)
    console.log('🧾 [CREATE EXPENSE] Payload recibido:', req.body);
    console.log('🕒 [CREATE EXPENSE] Fecha del cliente:', date);
    console.log('🕒 [CREATE EXPENSE] Tipo de fecha del cliente:', typeof date);

    if (!type || !paymentMethods || !amount) {
      return response(res, 400, 'Faltan campos obligatorios (type, paymentMethods, amount)');
    }

    // ✅ VALIDAR Y USAR LA FECHA DEL CLIENTE
    let expenseDate;
    if (date) {
      // Si el cliente envía una fecha, normalizarla a formato Colombia (YYYY-MM-DD)
      expenseDate = formatDateForDB(date);
      console.log('🕒 [CREATE EXPENSE] Usando fecha del cliente normalizada:', expenseDate);
    } else {
      // Solo si no hay fecha del cliente, usar fecha del servidor
      expenseDate = getColombiaDate();
      console.log('🕒 [CREATE EXPENSE] Usando fecha del servidor (fallback):', expenseDate);
    }

    const dataToInsert = {
      date: expenseDate,
      type,
      description,
      paymentMethods,
      amount,
      destinatario
    };
    console.log('🧮 [CREATE EXPENSE] Datos preparados para insertar:', dataToInsert);

    const newExpense = await Expense.create(dataToInsert);

    response(res, 201, { 
      message: 'Gasto creado con éxito', 
      newExpense,
      serverInfo: {
        selectedDate: expenseDate,
        serverCurrentDate: getColombiaDate(),
        timezone: 'America/Bogota'
      }
    });
  }
  catch (error) {
    console.error('❌ [CREATE EXPENSE] Error al crear el gasto:', error);
    response(res, 500, `Error al crear el gasto: ${error.message}`);
  }
}