const { OrderDetail, Receipt, Expense, CreditPayment, Reservation, User } = require("../../data");
const { Op } = require("sequelize");
const { getColombiaDate } = require("../../utils/dateUtils");

const getBalance = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, pointOfSale } = req.query;

    console.log("🔍 Parámetros recibidos:", { startDate, endDate, paymentMethod, pointOfSale });

    let dateFilter = {};

    // ✅ Manejo de fechas mejorado con más flexibilidad
    if (!startDate && !endDate) {
      // Si no hay fechas, usar día actual de Colombia
      const today = getColombiaDate();
      console.log("📅 Sin fechas especificadas, usando día actual:", today);
      
      // ✅ Buscar TODO el día actual
      const nextDay = new Date(today);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayString = nextDay.toISOString().split('T')[0];
      
      dateFilter.date = {
        [Op.gte]: today,
        [Op.lt]: nextDayString
      };
    } else {
      dateFilter.date = {};
      
      if (startDate) {
        dateFilter.date[Op.gte] = startDate;
        console.log("📅 Fecha inicio:", startDate);
      }
      
      if (endDate) {
        // Incluir todo el día de endDate
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayString = nextDay.toISOString().split('T')[0];
        dateFilter.date[Op.lt] = nextDayString;
        console.log("📅 Fecha fin (hasta):", nextDayString);
      }
    }

    console.log("🔍 Filtro de fecha aplicado:", JSON.stringify(dateFilter, null, 2));

    // ✅ PASO 1: Obtener ventas online con ENUM CORRECTO
    console.log("🌐 Buscando ventas online...");
    const onlineSales = await OrderDetail.findAll({
      where: {
        ...dateFilter,
        pointOfSale: 'Online',
        // ✅ USAR SOLO LOS VALORES VÁLIDOS DEL ENUM
        transaction_status: {
          [Op.in]: ['Pendiente', 'Aprobado'] // ✅ Solo valores que existen en tu ENUM
        }
      },
      attributes: [
        'id_orderDetail',
        'date',
        'amount',
        'pointOfSale',
        'transaction_status',
        'discount',
       
      ],
      order: [['date', 'DESC']]
    });

    console.log(`✅ Ventas online encontradas: ${onlineSales.length}`);
    if (onlineSales.length > 0) {
      console.log("📊 Muestra de ventas online:", onlineSales.slice(0, 2).map(s => ({
        id: s.id_orderDetail,
        date: s.date,
        amount: s.amount,
        status: s.transaction_status
      })));
    }

    // ✅ PASO 2: Obtener ventas locales (Receipts)
    console.log("🏪 Buscando ventas locales...");
    let localSalesFilter = { ...dateFilter };

    if (paymentMethod && paymentMethod !== 'Todos') {
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
       
      ],
      order: [['date', 'DESC']]
    });

    console.log(`✅ Ventas locales encontradas: ${localSales.length}`);
    if (localSales.length > 0) {
      console.log("📊 Muestra de ventas locales:", localSales.slice(0, 2).map(s => ({
        id: s.id_receipt,
        date: s.date,
        amount: s.total_amount,
        method: s.payMethod
      })));
    }

    // ✅ PASO 3: Obtener pagos parciales de reservas
    console.log("💳 Buscando pagos parciales...");
   const partialPayments = await CreditPayment.findAll({
  where: dateFilter,
  attributes: ['id_payment', 'id_reservation', 'amount', 'date'],
  include: [
    {
      model: Reservation,
      attributes: ['n_document', 'id_orderDetail', 'status'],
      required: false,
      // ✅ AGREGAR ESTE INCLUDE ANIDADO
      include: [
        {
          model: OrderDetail,
          attributes: ['id_orderDetail', 'n_document'],
          required: false,
          include: [
            {
              model: User,
              attributes: ['n_document', 'first_name', 'last_name', 'email'],
              required: false
            }
          ]
        }
      ]
    }
  ],
  order: [['date', 'DESC']]
});

    console.log(`✅ Pagos parciales encontrados: ${partialPayments.length}`);

    // ✅ PASO 4: Obtener gastos
    console.log("💸 Buscando gastos...");
    let expensesFilter = { ...dateFilter };

    if (paymentMethod && paymentMethod !== 'Todos') {
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
        'destinatario',
       
      ],
      order: [['date', 'DESC']]
    });

    

    console.log(`✅ Gastos encontrados: ${expenses.length}`);

    // ✅ PASO 5: Formatear datos para el frontend
    console.log("🔄 Formateando datos...");

    const formattedOnlineSales = onlineSales.map(sale => {
      const discount = parseFloat(sale.discount || 0);
      const originalAmount = parseFloat(sale.amount || 0);
      const amountWithDiscount = discount > 0 ? originalAmount * (1 - discount / 100) : originalAmount;
      
      return {
        id_orderDetail: sale.id_orderDetail,
        date: sale.date,
        amount: parseFloat(amountWithDiscount.toFixed(2)),
        originalAmount: originalAmount,
        discount: discount,
        pointOfSale: 'Online',
        transactionStatus: sale.transaction_status,
        paymentMethod: 'Wompi'
      };
    });

    const formattedLocalSales = localSales.map(sale => ({
      id: sale.id_receipt,
      date: sale.date,
      amount: parseFloat(sale.total_amount || 0),
      discount: parseFloat(sale.discount || 0),
      pointOfSale: 'Local',
      paymentMethod: sale.payMethod || 'Efectivo',
      cashierDocument: sale.cashier_document || 'Sin asignar',
      buyerName: sale.buyer_name || 'Cliente general',
      type: 'Venta Local'
    }));

    const formattedPartialPayments = partialPayments.map(payment => {
  // ✅ OBTENER EL NOMBRE DEL USUARIO
  let buyerName = 'Cliente no identificado';
  
  if (payment.Reservation?.OrderDetail?.User) {
    const user = payment.Reservation.OrderDetail.User;
    buyerName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Cliente no identificado';
  }

  return {
    id: payment.id_payment,
    date: payment.date,
    amount: parseFloat(payment.amount || 0),
    pointOfSale: 'Local',
    paymentMethod: 'Efectivo',
    type: 'Pago Parcial Reserva',
    reservationId: payment.id_reservation,
    reservationStatus: payment.Reservation?.status || 'Sin estado',
    n_document: payment.Reservation?.n_document || null,
    id_orderDetail: payment.Reservation?.id_orderDetail || null,
    // ✅ AGREGAR EL NOMBRE DEL COMPRADOR
    buyerName: buyerName,
    buyer_name: buyerName, // Para compatibilidad con el frontend
    description: buyerName // Para que aparezca en la columna descripción
  };
});

    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      date: expense.date,
      amount: parseFloat(expense.amount || 0),
      type: expense.type,
      paymentMethods: expense.paymentMethods,
      description: expense.description || 'Sin descripción',
      destinatario: expense.destinatario || 'No especificado'
    }));

    // ✅ PASO 6: Calcular totales
    const totalOnlineSales = formattedOnlineSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalLocalSales = formattedLocalSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalPartialPayments = formattedPartialPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalLocalSalesWithPartials = totalLocalSales + totalPartialPayments;
    const totalIncome = totalOnlineSales + totalLocalSalesWithPartials;
    const totalExpenses = formattedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpenses;

    // ✅ PASO 7: Calcular totales por cajero
    const cashierTotals = formattedLocalSales.reduce((acc, sale) => {
      const cashier = sale.cashierDocument || 'Sin asignar';
      acc[cashier] = parseFloat(((acc[cashier] || 0) + sale.amount).toFixed(2));
      return acc;
    }, {});

    console.log("📈 Totales calculados:", {
      totalOnlineSales: totalOnlineSales.toFixed(2),
      totalLocalSales: totalLocalSales.toFixed(2),
      totalPartialPayments: totalPartialPayments.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      balance: balance.toFixed(2)
    });

    // ✅ PASO 8: Estructura de respuesta compatible con el frontend
    const responseData = {
      balance: parseFloat(balance.toFixed(2)),
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalOnlineSales: parseFloat(totalOnlineSales.toFixed(2)),
      totalLocalSales: parseFloat(totalLocalSalesWithPartials.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      
      income: {
        online: formattedOnlineSales,
        local: [...formattedLocalSales, ...formattedPartialPayments]
      },
      
      expenses: formattedExpenses,
      cashierTotals,
      
      dateRange: {
        startDate: startDate || getColombiaDate(),
        endDate: endDate || getColombiaDate()
      },
      
      debug: {
        queriesExecuted: {
          onlineSales: onlineSales.length,
          localSales: localSales.length,
          partialPayments: partialPayments.length,
          expenses: expenses.length
        },
        dateFilter: dateFilter,
        filtersApplied: { paymentMethod, pointOfSale }
      }
    };

    console.log("✅ Enviando respuesta con estructura:", {
      balance: responseData.balance,
      totalIncome: responseData.totalIncome,
      onlineCount: responseData.income.online.length,
      localCount: responseData.income.local.length,
      expensesCount: responseData.expenses.length
    });

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("❌ Error en getBalance:", error);
    console.error("Stack trace:", error.stack);
    
    return res.status(500).json({ 
      success: false,
      error: {
        message: "Error interno del servidor al obtener el balance",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
};

module.exports = getBalance;