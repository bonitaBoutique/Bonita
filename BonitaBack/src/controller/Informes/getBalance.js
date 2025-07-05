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

    // ✅ PASO 2: VENTAS LOCALES CON PAGOS COMBINADOS
    console.log("🏪 Buscando ventas locales...");
    
    let localSalesFilter = { ...dateFilter };

    const localSales = await Receipt.findAll({
      where: localSalesFilter,
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

    console.log(`✅ Ventas locales encontradas: ${localSales.length}`);

    // ✅ LOG DETALLADO PARA DEBUG DE RECIBOS
    console.log("📋 Resumen de procesamiento de recibos:");
    localSales.forEach((sale, index) => {
      const saleData = sale.toJSON();
      const suma = (saleData.amount || 0) + (saleData.amount2 || 0);
      const diferencia = Math.abs((saleData.total_amount || 0) - suma);
      
      console.log(`Recibo ${index + 1}:`, {
        id: saleData.id_receipt,
        total: saleData.total_amount,
        metodo1: saleData.payMethod,
        monto1: saleData.amount,
        metodo2: saleData.payMethod2 || 'N/A',
        monto2: saleData.amount2 || 0,
        esCombinado: !!(saleData.payMethod2 && saleData.amount2),
        suma: suma,
        diferencia: diferencia,
        orderDetailId: saleData.OrderDetail?.id_orderDetail || 'Sin OrderDetail'
      });

      if (diferencia > 0.01) {
        console.warn(`⚠️ Discrepancia en recibo ${saleData.id_receipt}: 
          Suma calculada: ${suma}, Total registrado: ${saleData.total_amount}`);
      }
    });

    // ✅ OBTENER IDS DE ORDENES QUE YA TIENEN RECEIPT (ANTES DE PAGOS PARCIALES)
    const orderIdsWithReceipt = localSales
      .map(sale => sale.OrderDetail?.id_orderDetail)
      .filter(Boolean);
    
    console.log("🔍 OrderDetails con Receipt (para excluir de pagos de reserva):", orderIdsWithReceipt);

    // ✅ PASO 3: PAGOS PARCIALES DE RESERVAS - CORREGIDO PARA EVITAR DUPLICACIÓN
    console.log("💳 Buscando pagos parciales...");
    
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
            // ✅ CLAVE: Filtro para excluir reservas con órdenes que ya tienen Receipt
            where: {
              ...(orderIdsWithReceipt.length > 0 && {
                id_orderDetail: {
                  [Op.notIn]: orderIdsWithReceipt
                }
              })
            },
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
      
      console.log(`✅ Pagos parciales encontrados (después de filtrar duplicados): ${partialPayments.length}`);
      
      // ✅ LOG DE DEBUG para pagos parciales
      partialPayments.forEach((payment, index) => {
        console.log(`Pago parcial ${index + 1}:`, {
          id: payment.id_payment,
          reservationId: payment.id_reservation,
          amount: payment.amount,
          orderDetailId: payment.Reservation?.id_orderDetail || 'Sin OrderDetail',
          orderState: payment.Reservation?.OrderDetail?.state_order || 'Sin estado'
        });
      });
      
    } catch (creditPaymentError) {
      console.log('🟡 Error buscando pagos parciales (tabla CreditPayment puede no existir):', creditPaymentError.message);
      console.log('🟡 Continuando sin pagos parciales...');
      partialPayments = [];
    }

    // ✅ PASO 4: PAGOS INICIALES DE RESERVAS - CORREGIDO PARA EVITAR DUPLICACIÓN
    console.log("💰 Buscando pagos iniciales de reservas...");
    
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

    let initialReservationPayments = [];
    try {
      initialReservationPayments = await Reservation.findAll({
        where: {
          ...reservationDateFilter,
          partialPayment: {
            [Op.gt]: 0
          },
          // ✅ CLAVE: Excluir reservas cuyas órdenes ya tienen Receipt
          ...(orderIdsWithReceipt.length > 0 && {
            id_orderDetail: {
              [Op.notIn]: orderIdsWithReceipt
            }
          })
        },
        attributes: [
          'id_reservation',
          'id_orderDetail', 
          'n_document',
          'partialPayment',
          'createdAt',
          'status'
        ],
        include: [
          {
            model: OrderDetail,
            attributes: ['id_orderDetail', 'n_document', 'amount', 'state_order'],
            required: true,
            where: {
              // ✅ FILTRO ADICIONAL: Solo órdenes en estado de reserva
              state_order: {
                [Op.in]: ['Reserva a Crédito', 'Pendiente', 'Reserva Activa']
              }
            },
            include: [
              {
                model: User,
                attributes: ['n_document', 'first_name', 'last_name', 'email'],
                required: false
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      console.log(`✅ Pagos iniciales de reservas encontrados (sin duplicar): ${initialReservationPayments.length}`);
      
      // ✅ LOG DE DEBUG para pagos iniciales
      initialReservationPayments.forEach((reservation, index) => {
        console.log(`Pago inicial ${index + 1}:`, {
          id: reservation.id_reservation,
          orderDetailId: reservation.id_orderDetail,
          amount: reservation.partialPayment,
          orderState: reservation.OrderDetail?.state_order || 'Sin estado',
          status: reservation.status
        });
      });
      
    } catch (reservationError) {
      console.log('🟡 Error buscando pagos iniciales de reservas:', reservationError.message);
      console.log('🟡 Continuando sin pagos iniciales...');
      initialReservationPayments = [];
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

    // ✅ Ventas locales CON SEPARACIÓN DE PAGOS COMBINADOS
    const formattedLocalSales = [];
    
    localSales.forEach(sale => {
      const saleData = sale.toJSON();
      
      // ✅ VALIDACIÓN: Verificar que amount + amount2 = total_amount
      const calculatedTotal = (saleData.amount || 0) + (saleData.amount2 || 0);
      const actualTotal = saleData.total_amount || 0;
      
      if (Math.abs(calculatedTotal - actualTotal) > 0.01) {
        console.warn(`⚠️ Discrepancia en recibo ${saleData.id_receipt}: 
          Calculado: ${calculatedTotal}, Total: ${actualTotal}`);
      }
      
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

    console.log(`✅ Total ventas locales formateadas: ${formattedLocalSales.length}`);
    console.log(`✅ Pagos combinados detectados: ${formattedLocalSales.filter(sale => !sale.isMainPayment).length}`);

    // ✅ Pagos parciales
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

    // ✅ Pagos iniciales de reservas
    const formattedInitialReservationPayments = initialReservationPayments.map(reservation => {
      let buyerName = 'Cliente no identificado';
      
      if (reservation.OrderDetail?.User) {
        const user = reservation.OrderDetail.User;
        buyerName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Cliente no identificado';
      }

      return {
        id: `initial-${reservation.id_reservation}`,
        date: reservation.createdAt,
        amount: parseFloat(reservation.partialPayment || 0),
        pointOfSale: 'Local',
        paymentMethod: 'Efectivo',
        type: 'Pago Inicial Reserva',
        reservationId: reservation.id_reservation,
        reservationStatus: reservation.status || 'Sin estado',
        n_document: reservation.n_document || null,
        id_orderDetail: reservation.id_orderDetail || null,
        buyerName: buyerName,
        buyer_name: buyerName,
        description: `${buyerName} - Pago inicial reserva`,
        totalReservationAmount: reservation.OrderDetail?.amount || 0
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

    // ✅ VERIFICACIÓN DE DUPLICACIONES ADICIONAL
    console.log("🔍 VERIFICANDO DUPLICACIONES ADICIONALES:");

    const orderDetailsInLocal = formattedLocalSales
      .map(sale => sale.id_orderDetail)
      .filter(Boolean);
      
    const orderDetailsInReservations = formattedInitialReservationPayments
      .map(payment => payment.id_orderDetail)
      .filter(Boolean);

    const duplicatedOrders = orderDetailsInLocal.filter(orderId => 
      orderDetailsInReservations.includes(orderId)
    );

    if (duplicatedOrders.length > 0) {
      console.warn("⚠️ ORDENES DUPLICADAS DETECTADAS:", duplicatedOrders);
      console.warn("Estas órdenes aparecen tanto en ventas locales como en pagos de reserva");
      
      // ✅ FILTRAR duplicados de pagos iniciales
      const filteredInitialPayments = formattedInitialReservationPayments.filter(payment => 
        !duplicatedOrders.includes(payment.id_orderDetail)
      );
      
      console.log(`🔧 Pagos iniciales filtrados: ${formattedInitialReservationPayments.length} -> ${filteredInitialPayments.length}`);
      
      // ✅ ACTUALIZAR la lista
      formattedInitialReservationPayments.length = 0;
      formattedInitialReservationPayments.push(...filteredInitialPayments);
    } else {
      console.log("✅ No se detectaron duplicaciones adicionales");
    }

    // ✅ PASO 7: CALCULAR TOTALES POR MÉTODO DE PAGO
    console.log("📊 Calculando totales por método de pago...");

    // ✅ Combinar todos los pagos locales
    const allLocalPayments = [
      ...formattedLocalSales,
      ...formattedPartialPayments,
      ...formattedInitialReservationPayments
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
    const ingresosPagosIniciales = formattedInitialReservationPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

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
      ingresosTarjeta: ingresosTarjeta.toFixed(2),
      ingresosNequi: ingresosNequi.toFixed(2),
      ingresosBancolombia: ingresosBancolombia.toFixed(2),
      ingresosAddi: ingresosAddi.toFixed(2),
      ingresosSistecredito: ingresosSistecredito.toFixed(2),
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
          formattedLocalSales: formattedLocalSales.length,
          partialPayments: partialPayments.length,
          initialReservationPayments: initialReservationPayments.length,
          expenses: expenses.length
        },
        combinedPaymentsCount: formattedLocalSales.filter(sale => !sale.isMainPayment).length,
        duplicatedOrders: duplicatedOrders,
        orderIdsWithReceipt: orderIdsWithReceipt,
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
      paymentMethodBreakdown: responseData.paymentMethodBreakdown,
      combinedPayments: responseData.debug.combinedPaymentsCount,
      duplicatedOrdersFound: duplicatedOrders.length
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