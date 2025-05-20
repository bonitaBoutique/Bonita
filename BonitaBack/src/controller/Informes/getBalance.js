const { OrderDetail, Receipt, Expense, CreditPayment, Reservation } = require("../../data");
const { Op } = require("sequelize");

const getBalance = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, pointOfSale } = req.query;

    console.log("Fechas recibidas:", startDate, endDate);

    let dateFilter = {};

    // Si no hay fechas, filtra por el día actual en Colombia
    if (!startDate && !endDate) {
      const now = new Date();
      const dateColombia = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
      const todayColombia = dateColombia.toISOString().split('T')[0];
      dateFilter.date = todayColombia;
    } else if (startDate || endDate) {
      // Si es el mismo día, usamos estrategia especial
      if (startDate && endDate && startDate === endDate) {
        // Configurar para filtrar exactamente un día completo
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayString = nextDay.toISOString().split('T')[0];

        dateFilter.date = {
          [Op.gte]: startDate,
          [Op.lt]: nextDayString
        };
      } else {
        // Comportamiento normal para rangos diferentes
        dateFilter.date = {};

        if (startDate) {
          dateFilter.date[Op.gte] = startDate;
        }

        if (endDate) {
          // Sumamos un día para incluir todo el endDate
          const nextDay = new Date(endDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayString = nextDay.toISOString().split('T')[0];
          dateFilter.date[Op.lt] = nextDayString;
        }
      }
    }

    console.log("Filtro de fecha modificado:", JSON.stringify(dateFilter));
console.log("Fechas recibidas en backend:", startDate, endDate);
console.log("Filtro de fecha aplicado:", dateFilter);
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
console.log("OnlineSales enviados:", formattedOnlineSales);
console.log("LocalSales enviados:", formattedLocalSales);
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
console.log("Filtro de fecha para Expense:", dateFilter);
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
console.log("Expenses encontrados:", expenses.map(e => ({ id: e.id, date: e.date })));
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