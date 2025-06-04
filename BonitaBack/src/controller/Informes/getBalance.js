const { OrderDetail, Receipt, Expense, CreditPayment, Reservation } = require("../../data");
const { Op } = require("sequelize");
const { getColombiaDate } = require("../../utils/dateUtils");

const getBalance = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, pointOfSale } = req.query;

    console.log("Fechas recibidas:", startDate, endDate);

    let dateFilter = {};

    // ✅ Simplificar manejo de fechas usando la utilidad
    if (!startDate && !endDate) {
      // Si no hay fechas, usar día actual de Colombia
      dateFilter.date = getColombiaDate();
    } else if (startDate || endDate) {
      // Si es el mismo día, usamos estrategia especial
      if (startDate && endDate && startDate === endDate) {
        // Filtrar exactamente un día completo
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

    console.log("Filtro de fecha aplicado:", JSON.stringify(dateFilter));

    // ✅ Obtener ventas online con mejor manejo de errores
    const onlineSales = await OrderDetail.findAll({
      where: {
        ...dateFilter,
        pointOfSale: 'Online',
        // Asegurar que solo sean ventas completadas
        transaction_status: {
          [Op.in]: ['APPROVED', 'approved', 'Completada']
        }
      },
      attributes: [
        'id_orderDetail',
        'date',
        'amount',
        'pointOfSale',
        'transaction_status',
        'discount'
      ],
      order: [['date', 'DESC']]
    });

    // ✅ Obtener ventas locales con filtro mejorado
    let localSalesFilter = {
      ...dateFilter
    };

    // Agregar filtro de método de pago si se especifica
    if (paymentMethod) {
      localSalesFilter.payMethod = paymentMethod;
    }

    const localSales = await Receipt.findAll({
      where: localSalesFilter,
      attributes: [
        'id_receipt',
        'buyer_name',
        'date',
        'total_amount',
        'payMethod',
        'cashier_document',
        'discount'
      ],
      order: [['date', 'DESC']]
    });

    // ✅ Obtener pagos parciales de reservas con mejor filtrado
    const partialPayments = await CreditPayment.findAll({
      where: dateFilter,
      attributes: ['id_payment', 'id_reservation', 'amount', 'date'],
      include: [
        {
          model: Reservation,
          attributes: ['n_document', 'id_orderDetail', 'status'],
          required: true // Solo pagos con reservas válidas
        }
      ],
      order: [['date', 'DESC']]
    });

    // ✅ Obtener gastos con filtro mejorado
    let expensesFilter = {
      ...dateFilter
    };

    // Agregar filtro de método de pago para gastos si se especifica
    if (paymentMethod) {
      expensesFilter.paymentMethods = paymentMethod;
    }

    const expenses = await Expense.findAll({
      where: expensesFilter,
      attributes: [
        'id',
        'date',
        'amount',
        'type',
        'paymentMethods',
        'description',
        'destinatario'
      ],
      order: [['date', 'DESC']]
    });

    console.log(`Encontrados: ${onlineSales.length} ventas online, ${localSales.length} ventas locales, ${partialPayments.length} pagos parciales, ${expenses.length} gastos`);

    // ✅ Formatear ventas online con cálculo de descuento
    const formattedOnlineSales = onlineSales.map(sale => {
      const discount = sale.discount || 0;
      const amountWithDiscount = sale.amount * (1 - discount / 100);
      
      return {
        id: sale.id_orderDetail,
        date: sale.date,
        amount: parseFloat(amountWithDiscount.toFixed(2)),
        originalAmount: sale.amount,
        discount: discount,
        pointOfSale: 'Online',
        transactionStatus: sale.transaction_status,
        paymentMethod: 'Wompi'
      };
    });

    // ✅ Formatear ventas locales con mejor manejo de datos
    const formattedLocalSales = localSales.map(sale => ({
      id: sale.id_receipt,
      date: sale.date,
      amount: parseFloat(sale.total_amount || 0),
      discount: sale.discount || 0,
      pointOfSale: 'Local',
      paymentMethod: sale.payMethod || 'Desconocido',
      cashierDocument: sale.cashier_document || 'Sin asignar',
      buyerName: sale.buyer_name || 'Cliente general',
    }));

    // ✅ Formatear pagos parciales de reservas
    const formattedPartialPayments = partialPayments.map(payment => ({
      id: payment.id_payment,
      date: payment.date,
      amount: parseFloat(payment.amount || 0),
      pointOfSale: 'Local',
      paymentMethod: 'Crédito - Pago Parcial',
      type: 'Pago Parcial Reserva',
      reservationId: payment.id_reservation,
      reservationStatus: payment.Reservation?.status || 'Sin estado',
      n_document: payment.Reservation?.n_document || null,
      id_orderDetail: payment.Reservation?.id_orderDetail || null,
    }));

    // ✅ Combinar todos los ingresos locales
    const allLocalIncome = [
      ...formattedLocalSales,
      ...formattedPartialPayments
    ];

    // ✅ Formatear gastos con mejor estructura
    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      date: expense.date,
      amount: parseFloat(expense.amount || 0),
      type: expense.type,
      paymentMethod: expense.paymentMethods,
      description: expense.description || 'Sin descripción',
      destinatario: expense.destinatario || 'No especificado'
    }));

    // ✅ Calcular totales con precisión decimal
    const totalOnlineSales = formattedOnlineSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalLocalSales = allLocalIncome.reduce((sum, sale) => sum + sale.amount, 0);
    const totalIncome = totalOnlineSales + totalLocalSales;
    const totalExpenses = formattedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpenses;

    // ✅ Calcular totales por cajero (solo ventas locales directas)
    const cashierTotals = formattedLocalSales.reduce((acc, sale) => {
      const cashier = sale.cashierDocument || 'Sin asignar';
      acc[cashier] = parseFloat(((acc[cashier] || 0) + sale.amount).toFixed(2));
      return acc;
    }, {});

    // ✅ Calcular totales por método de pago
    const paymentMethodTotals = [...formattedLocalSales, ...formattedOnlineSales].reduce((acc, sale) => {
      const method = sale.paymentMethod || 'Desconocido';
      acc[method] = parseFloat(((acc[method] || 0) + sale.amount).toFixed(2));
      return acc;
    }, {});

    // ✅ Estadísticas adicionales
    const stats = {
      totalTransactions: formattedOnlineSales.length + allLocalIncome.length,
      onlineTransactions: formattedOnlineSales.length,
      localTransactions: allLocalIncome.length,
      averageTicket: totalIncome > 0 ? parseFloat((totalIncome / (formattedOnlineSales.length + allLocalIncome.length)).toFixed(2)) : 0,
      totalDiscountGiven: [...formattedOnlineSales, ...formattedLocalSales].reduce((sum, sale) => {
        if (sale.originalAmount && sale.discount) {
          return sum + (sale.originalAmount - sale.amount);
        }
        return sum;
      }, 0)
    };

    // ✅ Respuesta estructurada al frontend
    return res.status(200).json({
      success: true,
      data: {
        // Totales principales
        balance: parseFloat(balance.toFixed(2)),
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalOnlineSales: parseFloat(totalOnlineSales.toFixed(2)),
        totalLocalSales: parseFloat(totalLocalSales.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        
        // Detalle de transacciones
        income: {
          online: formattedOnlineSales,
          local: allLocalIncome
        },
        expenses: formattedExpenses,
        
        // Análisis adicionales
        cashierTotals,
        paymentMethodTotals,
        statistics: stats,
        
        // Metadatos
        dateRange: {
          startDate: startDate || getColombiaDate(),
          endDate: endDate || getColombiaDate()
        },
        filters: {
          paymentMethod: paymentMethod || 'Todos',
          pointOfSale: pointOfSale || 'Todos'
        }
      }
    });

  } catch (error) {
    console.error("Error en getBalance:", error);
    return res.status(500).json({ 
      success: false,
      error: {
        message: "Error interno del servidor al obtener el balance",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

module.exports = getBalance;