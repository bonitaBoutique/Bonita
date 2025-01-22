const { Expense } = require('../../data');
const { Op } = require('sequelize');

const filterExpenses = async (req, res) => {
  try {
    const { startDate, endDate, minAmount, maxAmount, type, paymentMethods } = req.query;
    const where = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.date[Op.lte] = new Date(endDate);
      }
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        where.amount[Op.gte] = minAmount;
      }
      if (maxAmount) {
        where.amount[Op.lte] = maxAmount;
      }
    }

    if (type) {
      where.type = type;
    }
    if (paymentMethods) {
      where.paymentMethods = paymentMethods;
     
    }


    const expenses = await Expense.findAll({ where });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = filterExpenses;

