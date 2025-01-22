const { OrderDetail, Receipt, Expense } = require("../../data");
const { Op } = require("sequelize");

const getBalance = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod,  pointOfSale } = req.query;

    const dateFilter = {
      date: {
        [Op.between]: [startDate || '2000-01-01', endDate || new Date()]
      }
    };

    // Get online sales
    const onlineSales = await OrderDetail.findAll({
      where: {
        ...dateFilter,
        pointOfSale: 'Online',
        transaction_status: 'Aprobado'
      },
      attributes: [
        'id_orderDetail',
        'date',
        'amount',
        'pointOfSale',
        'transaction_status'
      ]
    });

    // Get local sales from receipts
    const localSales = await Receipt.findAll({
      where: {
        ...dateFilter,
        ...(paymentMethod && { payMethod: paymentMethod })
      },
      attributes: [
        'id_receipt',
        'date',
        'total_amount',
        'payMethod'
      ]
    });

    // Get expenses
    const expenses = await Expense.findAll({
      where: {
        ...dateFilter,
        ...(paymentMethod && { paymentMethods: paymentMethod })
      },
      attributes: [
        'id',
        'date',
        'amount',
        'type',
        'paymentMethods',
        'description'
      ]
    });

    // Calculate totals
    const totalOnlineSales = onlineSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalLocalSales = localSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalIncome = totalOnlineSales + totalLocalSales;
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpenses;

    return res.status(200).json({
      balance,
      totalIncome,
      totalOnlineSales,
      totalLocalSales,
      totalExpenses,
      income: {
        online: onlineSales,
        local: localSales
      },
      expenses
    });

  } catch (error) {
    console.error("Error in getBalance:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = getBalance;