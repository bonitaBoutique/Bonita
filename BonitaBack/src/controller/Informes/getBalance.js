const { OrderDetail, Receipt, Expense, CreditPayment, Reservation } = require("../../data");
const { Op } = require("sequelize");

const getBalance = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, pointOfSale } = req.query;

// Si hay fechas, ajusta el rango para incluir todo el día
const start = startDate 
  ? new Date(new Date(`${startDate}T00:00:00`).toLocaleString("en-US", { timeZone: "America/Bogota" }))
  : new Date('2000-01-01T00:00:00');

const end = endDate 
  ? new Date(new Date(`${endDate}T23:59:59.999`).toLocaleString("en-US", { timeZone: "America/Bogota" }))
  : new Date();

const dateFilter = {
  date: {
    [Op.between]: [start, end]
  }
};

    // Obtener ventas online
    const onlineSales = await OrderDetail.findAll({
      where: {
        ...dateFilter,
        pointOfSale: 'Online'
      },
      attributes: [
        'id_orderDetail',
        'date',
        'amount',
        'pointOfSale',
        'transaction_status'
      ]
    });

    // Obtener ventas locales exclusivamente de Receipt
    const localSales = await Receipt.findAll({
      where: {
        ...dateFilter,
        ...(paymentMethod && { payMethod: paymentMethod })
      },
      attributes: [
        'id_receipt',
        'buyer_name',
        'date',
        'total_amount',
        'payMethod',
        'cashier_document'
      ]
    });

    // Obtener pagos parciales de reservas
    const partialPayments = await CreditPayment.findAll({
      where: { ...dateFilter },
      attributes: ['id_payment', 'id_reservation', 'amount', 'date'],
      include: [
        {
          model: Reservation,
          attributes: ['n_document', 'id_orderDetail'],
        }
      ]
    });

    // Obtener gastos
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

    // Formatear ventas online
    const formattedOnlineSales = onlineSales.map(sale => ({
      id: sale.id_orderDetail,
      date: sale.date,
      amount: sale.amount,
      pointOfSale: 'Online',
      transactionStatus: sale.transaction_status,
      paymentMethod: 'Wompi'
    }));

    // Formatear ventas locales
    const formattedLocalSales = localSales.map(sale => ({
      id: sale.id_receipt,
      date: sale.date,
      amount: sale.total_amount,
      pointOfSale: 'Local',
      paymentMethod: sale.payMethod || 'Desconocido',
      cashierDocument: sale.cashier_document,
      buyerName: sale.buyer_name || 'Desconocido',
    }));

    // Formatear pagos parciales de reservas
    const formattedPartialPayments = partialPayments.map(payment => ({
      id: payment.id_payment,
      date: payment.date,
      amount: payment.amount,
      pointOfSale: 'Local',
      paymentMethod: 'Crédito',
      type: 'Pago Parcial Reserva',
      reservationId: payment.id_reservation,
      n_document: payment.Reservation ? payment.Reservation.n_document : null,
      id_orderDetail: payment.Reservation ? payment.Reservation.id_orderDetail : null,
    }));

    // Unir ventas locales y pagos parciales de reservas
    const allLocalIncome = [
      ...formattedLocalSales,
      ...formattedPartialPayments
    ];

    // Calcular totales
    const totalOnlineSales = formattedOnlineSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalLocalSales = allLocalIncome.reduce((sum, sale) => sum + sale.amount, 0);
    const totalIncome = totalOnlineSales + totalLocalSales;
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpenses;

    // Calcular totales por cajero (solo ventas locales, no pagos parciales)
    const cashierTotals = formattedLocalSales.reduce((acc, sale) => {
      const cashier = sale.cashierDocument || 'Unknown';
      acc[cashier] = (acc[cashier] || 0) + sale.amount;
      return acc;
    }, {});

    // Respuesta al frontend
    return res.status(200).json({
      balance,
      totalIncome,
      totalOnlineSales,
      totalLocalSales,
      totalExpenses,
      income: {
        online: formattedOnlineSales,
        local: allLocalIncome // Incluye ventas locales y pagos parciales
      },
      expenses,
      cashierTotals
    });

  } catch (error) {
    console.error("Error en getBalance:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = getBalance;