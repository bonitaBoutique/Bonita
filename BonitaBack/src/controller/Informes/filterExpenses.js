const { Expense } = require('../../data');
const { Op } = require('sequelize');

const filterExpenses = async (req, res) => {
  try {
    // Agrega 'destinatario' a la desestructuración de req.query
    const { startDate, endDate, minAmount, maxAmount, type, paymentMethods, destinatario } = req.query;
    const where = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        // Asegúrate de incluir todo el día de endDate
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.date[Op.lte] = endOfDay;
      }
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        where.amount[Op.gte] = parseFloat(minAmount); // Asegurar que sea número
      }
      if (maxAmount) {
        where.amount[Op.lte] = parseFloat(maxAmount); // Asegurar que sea número
      }
    }

    if (type) {
      // Si 'type' puede ser un array de tipos, usa Op.in
      // where.type = { [Op.in]: type.split(',') };
      // Si es solo uno:
      where.type = type;
    }
    if (paymentMethods) {
      // Si 'paymentMethods' puede ser un array, usa Op.in
      // where.paymentMethods = { [Op.in]: paymentMethods.split(',') };
      // Si es solo uno:
      where.paymentMethods = paymentMethods;
    }

    // NUEVO: Filtrar por destinatario si se proporciona
    if (destinatario) {
      // Puedes usar Op.like para búsquedas parciales (case-insensitive en algunos DBs)
      // where.destinatario = { [Op.like]: `%${destinatario}%` };
      // O para coincidencia exacta:
      where.destinatario = destinatario;
    }


    const expenses = await Expense.findAll({
       where,
       order: [['date', 'DESC']] // Opcional: ordenar resultados
    });
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error al filtrar gastos:', error); // Loguear el error
    res.status(500).json({ error: `Error al filtrar gastos: ${error.message}` });
  }
};

module.exports = filterExpenses;

