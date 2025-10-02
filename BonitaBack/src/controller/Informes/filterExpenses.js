const { Expense } = require('../../data');
const { Op } = require('sequelize');
const { formatDateForDB, getColombiaDate } = require('../../utils/dateUtils'); // ✅ IMPORTAR utilidades de fecha

// ✅ NUEVA: Función para manejar fechas de Colombia (igual que en StockMovements y Balance)
const parseDateForColombia = (dateString, isEndDate = false) => {
  if (!dateString) return null;
  
  console.log(`🕒 [filterExpenses] Input: ${dateString}, isEndDate: ${isEndDate}`);
  
  // Si es formato YYYY-MM-DD, interpretar como fecha local de Colombia
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    if (isEndDate) {
      // Para dateTo: 23:59:59.999 del día seleccionado
      const endDate = new Date(`${dateString}T23:59:59.999`);
      console.log(`📅 [filterExpenses dateTo] ${dateString} → ${endDate.toISOString()}`);
      return endDate;
    } else {
      // Para dateFrom: 00:00:00 del día seleccionado  
      const startDate = new Date(`${dateString}T00:00:00.000`);
      console.log(`📅 [filterExpenses dateFrom] ${dateString} → ${startDate.toISOString()}`);
      return startDate;
    }
  }
  
  return new Date(dateString);
};

const filterExpenses = async (req, res) => {
  try {
    // ✅ OBTENER FECHA DEL SERVIDOR (igual que en createExpense)
    const serverDate = getColombiaDate();
    
    const { startDate, endDate, minAmount, maxAmount, type, paymentMethods, destinatario } = req.query;

    // ✅ LOGS DE FECHA (para debugging)
    console.log('🕒 [FILTER EXPENSES] Fecha del servidor (Colombia):', serverDate);
    console.log('🕒 [FILTER EXPENSES] Filtros recibidos:', { startDate, endDate, type, paymentMethods, destinatario });

    const where = {};

    // ✅ LÓGICA DE FECHAS CORREGIDA CON ZONA HORARIA DE COLOMBIA
    if (startDate || endDate) {
      where.date = {};
      
      if (startDate) {
        where.date[Op.gte] = parseDateForColombia(startDate, false);
        console.log('🟢 [FILTER EXPENSES] StartDate Colombia:', startDate);
      }
      
      if (endDate) {
        where.date[Op.lte] = parseDateForColombia(endDate, true);
        console.log('🟢 [FILTER EXPENSES] EndDate Colombia:', endDate);
      }
    }
    // ✅ CAMBIO: Si no hay filtros de fecha, NO agregar filtro de fecha (mostrar todos)
    // Esto permite ver todos los gastos sin importar la fecha
    console.log('🟡 [FILTER EXPENSES] Filtros aplicados - dateFrom:', startDate, 'dateTo:', endDate);

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

