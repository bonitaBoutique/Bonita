const { Expense } = require('../../data');
const { Op } = require('sequelize');
const { formatDateForDB, getColombiaDate } = require('../../utils/dateUtils'); // ✅ IMPORTAR utilidades de fecha

const filterExpenses = async (req, res) => {
  try {
    // ✅ OBTENER FECHA DEL SERVIDOR (igual que en createExpense)
    const serverDate = getColombiaDate();
    
    const { startDate, endDate, minAmount, maxAmount, type, paymentMethods, destinatario } = req.query;

    // ✅ LOGS DE FECHA (para debugging)
    console.log('🕒 [FILTER EXPENSES] Fecha del servidor (Colombia):', serverDate);
    console.log('🕒 [FILTER EXPENSES] Filtros recibidos:', { startDate, endDate, type, paymentMethods, destinatario });

    const where = {};

    // ✅ LÓGICA DE FECHAS CORREGIDA
    if (startDate || endDate) {
      where.date = {};
      
      if (startDate) {
        // ✅ Usar formatDateForDB para consistencia con createExpense
        where.date[Op.gte] = formatDateForDB(startDate);
        console.log('🟢 [FILTER EXPENSES] StartDate formateada:', formatDateForDB(startDate));
      }
      
      if (endDate) {
        // ✅ Usar formatDateForDB para consistencia con createExpense
        where.date[Op.lte] = formatDateForDB(endDate);
        console.log('🟢 [FILTER EXPENSES] EndDate formateada:', formatDateForDB(endDate));
      }
    }
    // ✅ CAMBIO: Si no hay filtros de fecha, NO agregar filtro de fecha (mostrar todos)
    // Esto permite ver todos los gastos sin importar la fecha
    console.log('🟡 [FILTER EXPENSES] Sin filtros de fecha específicos - mostrando todos los gastos');

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        where.amount[Op.gte] = parseFloat(minAmount);
      }
      if (maxAmount) {
        where.amount[Op.lte] = parseFloat(maxAmount);
      }
    }

    if (type) {
      where.type = type;
    }
    
    if (paymentMethods) {
      where.paymentMethods = paymentMethods;
    }

    if (destinatario) {
      where.destinatario = destinatario;
    }

    console.log('🔍 [FILTER EXPENSES] Consulta WHERE final:', where);

    const expenses = await Expense.findAll({
       where,
       order: [['date', 'DESC']]
    });

    console.log(`🟢 [FILTER EXPENSES] Encontrados ${expenses.length} gastos`);

    res.status(200).json({
      expenses,
      serverInfo: {
        serverDate: serverDate,
        timezone: 'America/Bogota',
        filters: { startDate, endDate, type, paymentMethods, destinatario }
      }
    });

  } catch (error) {
    console.error('❌ [FILTER EXPENSES] Error al filtrar gastos:', error);
    res.status(500).json({ error: `Error al filtrar gastos: ${error.message}` });
  }
};

module.exports = filterExpenses;

