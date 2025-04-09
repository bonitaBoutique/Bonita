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

    // Obtener ventas online
    const onlineSales = await OrderDetail.findAll({
      where: {
        ...dateFilter,
        ...(pointOfSale && { pointOfSale }) // Filtrar por punto de venta si se proporciona
      },
      attributes: [
        'id_orderDetail',
        'date',
        'amount',
        'pointOfSale',
        'transaction_status'
      ]
    });

    // Obtener ventas locales desde recibos
    const localSales = await Receipt.findAll({
      where: {
        ...dateFilter,
        ...(paymentMethod && { payMethod: paymentMethod }) // Filtrar por método de pago si se proporciona
      },
      attributes: [
        'id_receipt',
        'date',
        'total_amount',
        'payMethod',
        'cashier_document' // Documento del cajero
      ]
    });

    // Obtener gastos
    const expenses = await Expense.findAll({
      where: {
        ...dateFilter,
        ...(paymentMethod && { paymentMethods: paymentMethod }) // Filtrar por método de pago si se proporciona
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

    // Formatear ventas online
    const formattedOnlineSales = onlineSales.map(sale => ({
      id: sale.id_orderDetail,
      date: sale.date,
      amount: sale.amount,
      pointOfSale: 'Online', // Forzar el valor a "Online"
      transactionStatus: sale.transaction_status,
      paymentMethod: 'Wompi' // Asignar Wompi como método de pago
    }));

    // Formatear ventas locales
    const formattedLocalSales = localSales.map(sale => ({
      id: sale.id_receipt,
      date: sale.date,
      amount: sale.total_amount,
      pointOfSale: 'Local',
      paymentMethod: sale.payMethod || 'Desconocido', // Usar método de pago o valor predeterminado
      cashierDocument: sale.cashier_document
    }));

    // Calcular totales
    const totalOnlineSales = formattedOnlineSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalLocalSales = formattedLocalSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalIncome = totalOnlineSales + totalLocalSales;
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpenses;

    // Calcular totales por cajero
    const cashierTotals = formattedLocalSales.reduce((acc, sale) => {
      const cashier = sale.cashierDocument || 'Unknown'; // Usar documento del cajero
      acc[cashier] = (acc[cashier] || 0) + sale.amount;
      return acc;
    }, {});

    // Logs para depuración
    console.log('Ventas Online:', formattedOnlineSales);
    console.log('Ventas Locales:', formattedLocalSales);
    console.log('Gastos:', expenses);
    console.log('Balance:', balance);

    // Respuesta al frontend
    return res.status(200).json({
      balance,
      totalIncome,
      totalOnlineSales,
      totalLocalSales,
      totalExpenses,
      income: {
        online: formattedOnlineSales,
        local: formattedLocalSales
      },
      expenses,
      cashierTotals // Totales por cajero
    });

  } catch (error) {
    console.error("Error en getBalance:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = getBalance;