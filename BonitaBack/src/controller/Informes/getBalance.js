const { OrderDetail, Receipt, Expense, CreditPayment, Reservation, User } = require("../../data");
const { Op } = require("sequelize");
const { getColombiaDate } = require("../../utils/dateUtils");

const getBalance = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, pointOfSale } = req.query;

    console.log("🔍 Parámetros recibidos:", { startDate, endDate, paymentMethod, pointOfSale });

    let dateFilter = {};

    // ✅ MANEJO DE FECHAS
    if (!startDate && !endDate) {
      const today = getColombiaDate();
      console.log("📅 Sin fechas especificadas, usando día actual:", today);
      
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
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayString = nextDay.toISOString().split('T')[0];
        dateFilter.date[Op.lt] = nextDayString;
        console.log("📅 Fecha fin (hasta):", nextDayString);
      }
    }

    console.log("🔍 Filtro de fecha aplicado:", JSON.stringify(dateFilter, null, 2));

    // ✅ PASO 1: VENTAS ONLINE
    console.log("🌐 Buscando ventas online...");
    const onlineSales = await OrderDetail.findAll({
      where: {
        ...dateFilter,
        pointOfSale: 'Online',
        transaction_status: {
          [Op.in]: ['Pendiente', 'Aprobado']
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

    // ✅ PASO 2: VENTAS LOCALES NORMALES (EXCLUYENDO RESERVAS A CRÉDITO)
    console.log("🏪 Buscando ventas locales normales (sin reservas a crédito)...");
    
    let localSalesFilter = { ...dateFilter };

    const localSales = await Receipt.findAll({
      where: {
        ...localSalesFilter,
        // ✅ EXCLUIR recibos con método de pago "Crédito"
        payMethod: {
          [Op.not]: 'Crédito'
        }
      },
      attributes: [
        'id_receipt',
        'buyer_name',
        'buyer_email',
        'buyer_phone',        
        'date',
        'total_amount',
        'payMethod',
        'amount',
        'payMethod2',
        'amount2',
        'cashier_document',
        'createdAt',
        'estimated_delivery_date'
      ],
      include: [
        {
          model: OrderDetail,
          attributes: ['id_orderDetail', 'n_document', 'amount', 'pointOfSale', 'state_order'],
          required: false
        }
      ],
      order: [['date', 'DESC']]
    });

    console.log(`✅ Ventas locales normales encontradas: ${localSales.length}`);

    // ✅ PASO 3: PAGOS DE RESERVAS A CRÉDITO (USAR SOLO DATOS DE RESERVATION)
    console.log("💳 Buscando pagos de reservas a crédito...");
    
    let reservationDateFilter = {};
    if (!startDate && !endDate) {
      const today = getColombiaDate();
      const nextDay = new Date(today);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayString = nextDay.toISOString().split('T')[0];
      
      reservationDateFilter.createdAt = {
        [Op.gte]: today,
        [Op.lt]: nextDayString
      };
    } else {
      reservationDateFilter.createdAt = {};
      
      if (startDate) {
        reservationDateFilter.createdAt[Op.gte] = startDate;
      }
      
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayString = nextDay.toISOString().split('T')[0];
        reservationDateFilter.createdAt[Op.lt] = nextDayString;
      }
    }

    let reservationPayments = [];
    try {
      reservationPayments = await Reservation.findAll({
        where: {
          ...reservationDateFilter,
          partialPayment: {
            [Op.gt]: 0
          }
        },
        attributes: [
          'id_reservation',
          'id_orderDetail',
          'n_document',
          'partialPayment',
          'totalPaid',
          'createdAt',
          'status'
        ],
        include: [
          {
            model: OrderDetail,
            attributes: ['id_orderDetail', 'n_document', 'amount', 'state_order'],
            required: true,
            where: {
              state_order: {
                [Op.in]: ['Reserva a Crédito', 'Pendiente', 'Reserva Activa', 'Pedido Realizado']
              }
            },
            include: [
              {
                model: User,
                attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone'],
                required: false
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      console.log(`✅ Pagos iniciales de reservas encontrados: ${reservationPayments.length}`);
      
      // ✅ LOG DE DEBUG para pagos de reservas
      reservationPayments.forEach((reservation, index) => {
        console.log(`Pago reserva ${index + 1}:`, {
          id: reservation.id_reservation,
          orderDetailId: reservation.id_orderDetail,
          partialPayment: reservation.partialPayment,
          totalPaid: reservation.totalPaid,
          orderState: reservation.OrderDetail?.state_order || 'Sin estado',
          status: reservation.status
        });
      });
      
    } catch (reservationError) {
      console.log('🟡 Error buscando pagos de reservas:', reservationError.message);
      console.log('🟡 Continuando sin pagos de reservas...');
      reservationPayments = [];
    }

    // ✅ PASO 4: PAGOS PARCIALES ADICIONALES
    console.log("💰 Buscando pagos parciales adicionales...");
    
    let partialPayments = [];
    try {
      partialPayments = await CreditPayment.findAll({
        where: dateFilter,
        attributes: ['id_payment', 'id_reservation', 'amount', 'date'],
        include: [
          {
            model: Reservation,
            attributes: ['n_document', 'id_orderDetail', 'status'],
            required: true,
            include: [
              {
                model: OrderDetail,
                attributes: ['id_orderDetail', 'n_document', 'state_order'],
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
      
      console.log(`✅ Pagos parciales adicionales encontrados: ${partialPayments.length}`);
      
    } catch (creditPaymentError) {
      console.log('🟡 Error buscando pagos parciales:', creditPaymentError.message);
      partialPayments = [];
    }

    // ✅ PASO 5: GASTOS
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

    // ✅ PASO 6: FORMATEAR DATOS
    console.log("🔄 Formateando datos...");

    // ✅ Ventas online
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

    // ✅ Ventas locales normales CON SEPARACIÓN DE PAGOS COMBINADOS
    const formattedLocalSales = [];
    
    localSales.forEach(sale => {
      const saleData = sale.toJSON();
      
      // ✅ PAGO PRINCIPAL (siempre existe)
      const mainPayment = {
        id: `${sale.id_receipt}-main`,
        originalReceiptId: sale.id_receipt,
        date: sale.date,
        amount: parseFloat(saleData.amount || 0),
        pointOfSale: 'Local',
        paymentMethod: saleData.payMethod || 'Efectivo',
        cashierDocument: saleData.cashier_document || 'Sin asignar',
        buyerName: saleData.buyer_name || 'Cliente general',
        buyerEmail: saleData.buyer_email || '',
        buyerPhone: saleData.buyer_phone || '',
        type: 'Venta Local',
        isMainPayment: true,
        totalReceiptAmount: parseFloat(saleData.total_amount || 0),
        hasSecondaryPayment: !!(saleData.payMethod2 && saleData.amount2),
        id_orderDetail: saleData.OrderDetail?.id_orderDetail || null
      };

      formattedLocalSales.push(mainPayment);

      // ✅ PAGO SECUNDARIO (solo si existe)
      if (saleData.payMethod2 && saleData.amount2 && saleData.amount2 > 0) {
        const secondaryPayment = {
          id: `${sale.id_receipt}-secondary`,
          originalReceiptId: sale.id_receipt,
          date: sale.date,
          amount: parseFloat(saleData.amount2 || 0),
          pointOfSale: 'Local',
          paymentMethod: saleData.payMethod2,
          cashierDocument: saleData.cashier_document || 'Sin asignar',
          buyerName: saleData.buyer_name || 'Cliente general',
          buyerEmail: saleData.buyer_email || '',
          buyerPhone: saleData.buyer_phone || '',
          type: 'Venta Local (Pago Combinado)',
          isMainPayment: false,
          totalReceiptAmount: parseFloat(saleData.total_amount || 0),
          relatedToMainPayment: `${sale.id_receipt}-main`,
          id_orderDetail: saleData.OrderDetail?.id_orderDetail || null
        };

        formattedLocalSales.push(secondaryPayment);
      }
    });

    // ✅ Pagos de reservas (SOLO PAGOS INICIALES)
    const formattedReservationPayments = reservationPayments.map(reservation => {
      let buyerName = 'Cliente no identificado';
      
      if (reservation.OrderDetail?.User) {
        const user = reservation.OrderDetail.User;
        buyerName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Cliente no identificado';
      }

      return {
        id: `reservation-${reservation.id_reservation}`,
        date: reservation.createdAt,
        amount: parseFloat(reservation.partialPayment || 0), // ✅ SOLO EL PAGO INICIAL
        pointOfSale: 'Local',
        paymentMethod: 'Efectivo',
        cashierDocument: 'Sin asignar',
        buyerName: buyerName,
        buyerEmail: reservation.OrderDetail?.User?.email || '',
        buyerPhone: reservation.OrderDetail?.User?.phone || '',
        type: 'Pago Inicial Reserva',
        isMainPayment: true,
        totalReceiptAmount: parseFloat(reservation.partialPayment || 0),
        hasSecondaryPayment: false,
        id_orderDetail: reservation.id_orderDetail,
        reservationId: reservation.id_reservation,
        totalReservationAmount: reservation.OrderDetail?.amount || 0
      };
    });

    // ✅ Pagos parciales adicionales
    const formattedPartialPayments = partialPayments.map(payment => {
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
        buyerName: buyerName,
        buyer_name: buyerName,
        description: buyerName
      };
    });

    // ✅ Gastos
    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      date: expense.date,
      amount: parseFloat(expense.amount || 0),
      type: expense.type,
      paymentMethods: expense.paymentMethods,
      description: expense.description || 'Sin descripción',
      destinatario: expense.destinatario || 'No especificado'
    }));

    console.log(`✅ Total ventas locales formateadas: ${formattedLocalSales.length}`);
    console.log(`✅ Total pagos de reservas formateados: ${formattedReservationPayments.length}`);
    console.log(`✅ Total pagos parciales formateados: ${formattedPartialPayments.length}`);

    // ✅ PASO 7: CALCULAR TOTALES POR MÉTODO DE PAGO
    console.log("📊 Calculando totales por método de pago...");

    // ✅ Combinar todos los pagos locales
    const allLocalPayments = [
      ...formattedLocalSales,
      ...formattedReservationPayments,
      ...formattedPartialPayments
    ];

    // ✅ Función para calcular ingresos por método
    const calculateIncomeByMethod = (method) => {
      return allLocalPayments
        .filter(payment => payment.paymentMethod === method)
        .reduce((acc, payment) => acc + (payment.amount || 0), 0);
    };

    // ✅ Calcular totales por cada método
    const ingresosEfectivo = calculateIncomeByMethod("Efectivo");
    const ingresosTarjeta = calculateIncomeByMethod("Tarjeta");
    const ingresosNequi = calculateIncomeByMethod("Nequi");
    const ingresosBancolombia = calculateIncomeByMethod("Bancolombia");
    const ingresosAddi = calculateIncomeByMethod("Addi");
    const ingresosSistecredito = calculateIncomeByMethod("Sistecredito");
    const ingresosCredito = calculateIncomeByMethod("Crédito");
    const ingresosGiftCard = calculateIncomeByMethod("GiftCard");
    const ingresosOtro = calculateIncomeByMethod("Otro");

    // ✅ Separar pagos específicos
    const ingresosPagosParciales = formattedPartialPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const ingresosPagosIniciales = formattedReservationPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // ✅ Totales generales
    const totalOnlineSales = formattedOnlineSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalLocalSales = formattedLocalSales.reduce((sum, sale) => sum + sale.amount, 0);
    
    // ✅ Para el balance, excluir Addi y Sistecredito
    const totalLocalSalesForBalance = allLocalPayments
      .filter(payment => !['Addi', 'Sistecredito'].includes(payment.paymentMethod))
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const totalIncome = totalOnlineSales + totalLocalSalesForBalance;
    const totalExpenses = formattedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpenses;

    // ✅ Totales por cajero
    const cashierTotals = formattedLocalSales.reduce((acc, sale) => {
      const cashier = sale.cashierDocument || 'Sin asignar';
      acc[cashier] = parseFloat(((acc[cashier] || 0) + sale.amount).toFixed(2));
      return acc;
    }, {});

    console.log("📈 Totales calculados:", {
      totalOnlineSales: totalOnlineSales.toFixed(2),
      totalLocalSales: totalLocalSales.toFixed(2),
      totalLocalSalesForBalance: totalLocalSalesForBalance.toFixed(2),
      ingresosEfectivo: ingresosEfectivo.toFixed(2),
      ingresosPagosIniciales: ingresosPagosIniciales.toFixed(2),
      ingresosPagosParciales: ingresosPagosParciales.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      balance: balance.toFixed(2)
    });

    // ✅ PASO 8: ESTRUCTURA DE RESPUESTA
    const responseData = {
      balance: parseFloat(balance.toFixed(2)),
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalOnlineSales: parseFloat(totalOnlineSales.toFixed(2)),
      totalLocalSales: parseFloat(totalLocalSalesForBalance.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      
      income: {
        online: formattedOnlineSales,
        local: allLocalPayments
      },
      
      expenses: {
        data: formattedExpenses,
        loading: false,
        success: true,
        error: null
      },
      
      cashierTotals,
      
      // ✅ Desglose detallado por método de pago
      paymentMethodBreakdown: {
        efectivo: parseFloat(ingresosEfectivo.toFixed(2)),
        tarjeta: parseFloat(ingresosTarjeta.toFixed(2)),
        nequi: parseFloat(ingresosNequi.toFixed(2)),
        bancolombia: parseFloat(ingresosBancolombia.toFixed(2)),
        addi: parseFloat(ingresosAddi.toFixed(2)),
        sistecredito: parseFloat(ingresosSistecredito.toFixed(2)),
        credito: parseFloat(ingresosCredito.toFixed(2)),
        giftCard: parseFloat(ingresosGiftCard.toFixed(2)),
        otro: parseFloat(ingresosOtro.toFixed(2)),
        wompi: parseFloat(totalOnlineSales.toFixed(2)),
        pagosParciales: parseFloat(ingresosPagosParciales.toFixed(2)),
        pagosIniciales: parseFloat(ingresosPagosIniciales.toFixed(2))
      },
      
      dateRange: {
        startDate: startDate || getColombiaDate(),
        endDate: endDate || getColombiaDate()
      },
      
      debug: {
        queriesExecuted: {
          onlineSales: onlineSales.length,
          localSales: localSales.length,
          reservationPayments: reservationPayments.length,
          partialPayments: partialPayments.length,
          expenses: expenses.length
        },
        combinedPaymentsCount: formattedLocalSales.filter(sale => !sale.isMainPayment).length,
        dateFilter: dateFilter,
        reservationDateFilter: reservationDateFilter,
        filtersApplied: { paymentMethod, pointOfSale }
      }
    };

    console.log("✅ Enviando respuesta con estructura:", {
      balance: responseData.balance,
      totalIncome: responseData.totalIncome,
      onlineCount: responseData.income.online.length,
      localCount: responseData.income.local.length,
      expensesCount: responseData.expenses.data.length,
      paymentMethodBreakdown: responseData.paymentMethodBreakdown
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