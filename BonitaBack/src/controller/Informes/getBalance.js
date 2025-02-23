const { OrderDetail, Receipt, Expense } = require("../../data");
const { Op } = require("sequelize");

const getBalance = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, pointOfSale } = req.query;

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
        'payMethod',
        'cashier_document' // Use cashier_document instead of cashier
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

    // Calculate cashier-wise totals
    const cashierTotals = localSales.reduce((acc, sale) => {
      const cashier = sale.cashier_document || 'Unknown'; // Use cashier_document
      acc[cashier] = (acc[cashier] || 0) + sale.total_amount;
      return acc;
    }, {});

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
      expenses,
      cashierTotals // Send cashier totals to the frontend
    });

  } catch (error) {
    console.error("Error in getBalance:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = getBalance;