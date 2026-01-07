const { OrderDetail, Receipt, Expense, CreditPayment, Reservation, User, Payment, AddiSistecreditoDeposit, GiftCard } = require("../../data");
const { Op } = require("sequelize");
const { getColombiaDate } = require("../../utils/dateUtils");

// ✅ NUEVA: Función para manejar fechas de Colombia con soporte para campos DATE
const parseDateForColombia = (dateString, isEndDate = false, isDateField = false) => {
  if (!dateString) return null;
  
  console.log(`🕒 [getBalance] Input: ${dateString}, isEndDate: ${isEndDate}, isDateField: ${isDateField}`);
  
  // Si es formato YYYY-MM-DD
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // ✅ Para campos DATE (sin hora), devolver solo la fecha string
    if (isDateField) {
      console.log(`📅 [getBalance DATE field] ${dateString} → ${dateString}`);
      return dateString;
    }
    
    // Para campos TIMESTAMP
    if (isEndDate) {
      // Para dateTo: 23:59:59.999 del día seleccionado en Colombia (UTC-5)
      const endDate = new Date(`${dateString}T23:59:59.999-05:00`);
      console.log(`📅 [getBalance dateTo] ${dateString} → ${endDate.toISOString()}`);
      return endDate;
    } else {
      // Para dateFrom: 00:00:00 del día seleccionado en Colombia (UTC-5)
      const startDate = new Date(`${dateString}T00:00:00.000-05:00`);
      console.log(`📅 [getBalance dateFrom] ${dateString} → ${startDate.toISOString()}`);
      return startDate;
    }
  }
  
  return new Date(dateString);
};

const getBalance = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, pointOfSale } = req.query;

    console.log("🔍 Parámetros recibidos:", { startDate, endDate, paymentMethod, pointOfSale });

    let dateFilter = {};

    // ✅ MANEJO DE FECHAS PARA RECEIPTS CORREGIDO - Usar isDateField=true para campos DATE
    if (!startDate && !endDate) {
      const today = getColombiaDate();
      console.log("📅 Sin fechas especificadas, usando día actual:", today);
      
      // Para campos DATE, usar solo la fecha string
      dateFilter.date = {
        [Op.ne]: null, // Excluir nulls
        [Op.eq]: today
      };
    } else {
      dateFilter.date = {
        [Op.ne]: null // Excluir nulls
      };
      
      if (startDate) {
        const startDateValue = parseDateForColombia(startDate, false, true);
        dateFilter.date[Op.gte] = startDateValue;
        console.log("📅 Fecha inicio:", startDate, "→", startDateValue);
      }
      
      if (endDate) {
        const endDateValue = parseDateForColombia(endDate, true, true);
        dateFilter.date[Op.lte] = endDateValue;
        console.log("📅 Fecha fin:", endDate, "→", endDateValue);
      }
    }

    // ✅ FILTRO DE FECHA PARA RESERVAS (CORREGIDO) - Usar createdAt (TIMESTAMP)
    let reservationDateFilter = {};
    if (!startDate && !endDate) {
      const today = getColombiaDate();
      console.log("📅 Usando día actual para reservas:", today);
      
      reservationDateFilter.createdAt = {
        [Op.ne]: null,
        [Op.gte]: parseDateForColombia(today, false, false), // isDateField = false (TIMESTAMP)
        [Op.lte]: parseDateForColombia(today, true, false)
      };
    } else {
      reservationDateFilter.createdAt = {
        [Op.ne]: null
      };
      
      if (startDate) {
        const startValue = parseDateForColombia(startDate, false, false);
        reservationDateFilter.createdAt[Op.gte] = startValue;
        console.log("📅 Fecha inicio reservas:", startDate);
      }
      
      if (endDate) {
        const endValue = parseDateForColombia(endDate, true, false);
        reservationDateFilter.createdAt[Op.lte] = endValue;
        console.log("📅 Fecha fin reservas:", endDate);
      }
    }

    console.log("🔍 Filtro de fecha para Receipt:", JSON.stringify(dateFilter, null, 2));
    console.log("🔍 Filtro FINAL para reservas:", JSON.stringify(reservationDateFilter, null, 2));

    // ✅ DEBUG ESPECÍFICO PARA LA RESERVA DE LIGIA
    console.log("🔍 DEBUG: Buscando específicamente la reserva de Ligia...");
    try {
      const ligiaReservation = await Reservation.findOne({
        where: {
          id_reservation: "73039467-7e4f-460e-a6b1-19b5e97c9673"
        },
        attributes: ['id_reservation', 'createdAt', 'partialPayment', 'status']
      });
      
      if (ligiaReservation) {
        console.log("✅ Reserva de Ligia encontrada:", {
          id: ligiaReservation.id_reservation,
          createdAt: ligiaReservation.createdAt,
          partialPayment: ligiaReservation.partialPayment,
          status: ligiaReservation.status,
          createdAtType: typeof ligiaReservation.createdAt,
          createdAtString: ligiaReservation.createdAt.toString()
        });
        
        // ✅ VERIFICAR SI LA FECHA ESTÁ EN EL RANGO
        const reservationDate = new Date(ligiaReservation.createdAt);
        const filterStart = new Date(reservationDateFilter.createdAt[Op.gte] || reservationDateFilter.createdAt[Op.lte]);
        const filterEnd = new Date(reservationDateFilter.createdAt[Op.lte] || reservationDateFilter.createdAt[Op.gte]);
        
        console.log("🔍 Comparación de fechas:", {
          reservationDate: reservationDate.toISOString(),
          filterStart: filterStart.toISOString(),
          filterEnd: filterEnd.toISOString(),
          isInRange: reservationDate >= filterStart && reservationDate <= filterEnd
        });
      } else {
        console.log("❌ No se encontró la reserva de Ligia");
      }
    } catch (debugError) {
      console.log("🟡 Error en debug de Ligia:", debugError.message);
    }

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
        // ✅ EXCLUIR recibos con método de pago "Crédito" SOLAMENTE
        payMethod: {
          [Op.not]: 'Crédito'
        },
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
          required: false,
          where: {
            state_order: { [Op.not]: 'Reserva a Crédito' } // <-- EXCLUIR RESERVAS A CRÉDITO
          }
        },
        {
          // ✅ INCLUIR Payment para distinguir GiftCards compradas vs devolución
          model: Payment,
          attributes: ['id_payment', 'payMethod', 'amount'],
          required: false // No obligatorio, para incluir receipts sin payment
        },
        {
          // ✅ INCLUIR GiftCard para verificar si fue eliminada
          model: GiftCard,
          attributes: ['id_giftcard', 'buyer_email', 'saldo', 'estado'],
          required: false // No obligatorio, puede no tener giftcard asociada
        }
      ],
      order: [['date', 'DESC']]
    });

    console.log(`✅ Ventas locales normales encontradas: ${localSales.length}`);

    // ✅ PASO 3: PAGOS DE RESERVAS A CRÉDITO (USAR SOLO DATOS DE RESERVATION)
    console.log("💳 Buscando pagos de reservas a crédito...");
    
    let reservationPayments = [];
    try {
      // ✅ Obtener TODAS las reservas con pago inicial, sin filtro de fecha inicial
      // Luego filtraremos por Receipt.date en memoria
      const allReservationsWithPayment = await Reservation.findAll({
        where: {
          partialPayment: { [Op.gt]: 0 }
        },
        attributes: [
          'id_reservation',
          'id_orderDetail',
          'n_document',
          'partialPayment',
          'totalPaid',
          'createdAt',
          'status',
          'paymentMethod' // ✅ AGREGAR paymentMethod
        ],
        include: [
          {
            model: OrderDetail,
            attributes: ['id_orderDetail', 'n_document', 'amount', 'state_order'],
            required: false,
            include: [
              {
                model: User,
                attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone'],
                required: false
              },
              {
                model: Receipt,
                attributes: ['id_receipt', 'date'],
                required: false
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // ✅ FILTRAR en memoria basándonos en Receipt.date
      if (startDate && endDate) {
        reservationPayments = allReservationsWithPayment.filter(reservation => {
          const receiptDateRaw = reservation.OrderDetail?.Receipt?.date;
          
          if (receiptDateRaw) {
            // Si tiene Receipt.date, convertirlo a string YYYY-MM-DD
            let receiptDateStr;
            if (receiptDateRaw instanceof Date) {
              receiptDateStr = receiptDateRaw.toISOString().split('T')[0];
            } else if (typeof receiptDateRaw === 'string') {
              receiptDateStr = receiptDateRaw.split('T')[0]; // Por si viene con hora
            } else {
              receiptDateStr = String(receiptDateRaw).split('T')[0];
            }
            
            const isInRange = receiptDateStr >= startDate && receiptDateStr <= endDate;
            console.log(`🔍 Reservation ${reservation.id_reservation}: Receipt.date=${receiptDateStr}, inRange=${isInRange}`);
            return isInRange;
          } else {
            // Si NO tiene Receipt, usar createdAt (casos viejos)
            const createdDate = reservation.createdAt.toISOString().split('T')[0];
            const isInRange = createdDate >= startDate && createdDate <= endDate;
            console.log(`🔍 Reservation ${reservation.id_reservation}: No receipt, using createdAt=${createdDate}, inRange=${isInRange}`);
            return isInRange;
          }
        });
      } else {
        // Sin filtro de fechas, tomar todas
        reservationPayments = allReservationsWithPayment;
      }
      
      console.log(`✅ Pagos iniciales de reservas encontrados ANTES de filtrar: ${allReservationsWithPayment.length}`);
      console.log(`✅ Pagos iniciales de reservas encontrados DESPUÉS de filtrar: ${reservationPayments.length}`);
      
    } catch (reservationError) {
      console.log('🟡 Error buscando pagos de reservas:', reservationError.message);
      console.log('🟡 Stack trace:', reservationError.stack);
      reservationPayments = [];
    }

    // ✅ PASO 4: PAGOS PARCIALES ADICIONALES
    console.log("💰 Buscando pagos parciales adicionales...");
    
    // ✅ NUEVO: Filtro separado para CreditPayments.date (TIMESTAMP)
    let creditPaymentDateFilter = {};
    if (!startDate && !endDate) {
      const today = getColombiaDate();
      creditPaymentDateFilter.date = {
        [Op.ne]: null,
        [Op.gte]: parseDateForColombia(today, false, false), // isDateField = false (TIMESTAMP)
        [Op.lte]: parseDateForColombia(today, true, false)
      };
    } else {
      creditPaymentDateFilter.date = {
        [Op.ne]: null
      };
      
      if (startDate) {
        const startValue = parseDateForColombia(startDate, false, false);
        creditPaymentDateFilter.date[Op.gte] = startValue;
      }
      
      if (endDate) {
        const endValue = parseDateForColombia(endDate, true, false);
        creditPaymentDateFilter.date[Op.lte] = endValue;
      }
    }
    
    let partialPayments = [];
    try {
      partialPayments = await CreditPayment.findAll({
        where: creditPaymentDateFilter,
        attributes: ['id_payment', 'id_reservation', 'amount', 'date', 'paymentMethod'],
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
        order: [['date', 'DESC']],
        logging: console.log
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

    // ✅ PASO 5.5: OBTENER DEPÓSITOS DE ADDI/SISTECREDITO
    console.log("💰 Consultando depósitos de Addi/Sistecredito...");
    
    let depositDateFilter = {};
    if (!startDate && !endDate) {
      const today = getColombiaDate();
      // Para campos DATE, usar solo la fecha string
      depositDateFilter.depositDate = {
        [Op.ne]: null,
        [Op.eq]: today
      };
    } else {
      depositDateFilter.depositDate = {
        [Op.ne]: null
      };
      
      if (startDate) {
        const startValue = parseDateForColombia(startDate, false, true);
        depositDateFilter.depositDate[Op.gte] = startValue;
      }
      
      if (endDate) {
        const endValue = parseDateForColombia(endDate, true, true);
        depositDateFilter.depositDate[Op.lte] = endValue;
      }
    }

    const addiSistecreditoDeposits = await AddiSistecreditoDeposit.findAll({
      where: depositDateFilter,
      attributes: ['id', 'platform', 'depositDate', 'amount', 'referenceNumber', 'description', 'status'],
      order: [['depositDate', 'DESC']]
    });

    console.log(`✅ Depósitos Addi/Sistecredito encontrados: ${addiSistecreditoDeposits.length}`);

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
      
      // ✅ DIFERENCIAR: COMPRA DE GIFTCARD vs USO DE GIFTCARD
      // COMPRA: Receipt.payMethod = "GiftCard" + Payment.payMethod = método real (Efectivo, Tarjeta, etc.)
      // USO: Receipt tiene GiftCard en payMethod o payMethod2 como REDENCIÓN, sin Payment asociado
      
      const hasPaymentRecord = saleData.Payments && saleData.Payments.length > 0;
      const isGiftCardPurchase = saleData.payMethod === 'GiftCard' && hasPaymentRecord;
      
      // ✅ NUEVO: Verificar si la GiftCard fue eliminada
      // Si es compra de GiftCard pero NO tiene GiftCard asociada, significa que fue eliminada
      const hasGiftCard = saleData.GiftCards && saleData.GiftCards.length > 0;
      const isDeletedGiftCard = isGiftCardPurchase && !hasGiftCard;
      
      // ⚠️ SKIP: Si la GiftCard fue eliminada, no incluir este recibo en el balance
      if (isDeletedGiftCard) {
        console.log(`⚠️ GiftCard eliminada detectada - omitiendo recibo: ${sale.id_receipt}`);
        return; // Saltar este recibo
      }
      const isGiftCardRedemption = (saleData.payMethod === 'GiftCard' || saleData.payMethod2 === 'GiftCard') 
                                   && !hasPaymentRecord;
      
      // ✅ CASO 1: COMPRA DE GIFTCARD (debe aparecer en Balance con método real)
      if (isGiftCardPurchase) {
        console.log(`🎁 Compra de GiftCard detectada - usar método de Payment: ${sale.id_receipt}`);
        
        const realPaymentMethod = saleData.Payments[0].payMethod; // El método real usado para comprar
        const giftCardPurchase = {
          id: `${sale.id_receipt}-giftcard-purchase`,
          originalReceiptId: sale.id_receipt,
          date: sale.date,
          amount: parseFloat(saleData.amount || 0),
          pointOfSale: 'Local',
          paymentMethod: realPaymentMethod, // ✅ Usar el método REAL
          cashierDocument: saleData.cashier_document || 'Sin asignar',
          buyerName: saleData.buyer_name || 'Cliente general',
          buyerEmail: saleData.buyer_email || '',
          buyerPhone: saleData.buyer_phone || '',
          type: 'Compra GiftCard',
          isMainPayment: true,
          totalReceiptAmount: parseFloat(saleData.total_amount || 0),
          id_orderDetail: saleData.OrderDetail?.id_orderDetail || null
        };
        formattedLocalSales.push(giftCardPurchase);
        return; // Ya procesamos este receipt
      }
      
      // ✅ CASO 2: USO/REDENCIÓN DE GIFTCARD (solo mostrar método secundario si existe)
      if (isGiftCardRedemption) {
        console.log(`🎁 Redención de GiftCard detectada - SOLO mostrar método secundario: ${sale.id_receipt}`);
        
        // Si payMethod principal es GiftCard, solo agregar el secundario (si existe)
        if (saleData.payMethod === 'GiftCard' && saleData.payMethod2 && saleData.amount2 && saleData.amount2 > 0) {
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
            type: 'Venta Local (Pago con GiftCard)',
            isMainPayment: false,
            totalReceiptAmount: parseFloat(saleData.total_amount || 0),
            id_orderDetail: saleData.OrderDetail?.id_orderDetail || null
          };
          formattedLocalSales.push(secondaryPayment);
        }
        // Si payMethod2 es GiftCard, solo agregar el principal
        else if (saleData.payMethod2 === 'GiftCard' && saleData.amount && saleData.amount > 0) {
          const mainPayment = {
            id: `${sale.id_receipt}-main`,
            originalReceiptId: sale.id_receipt,
            date: sale.date,
            amount: parseFloat(saleData.amount || 0),
            pointOfSale: 'Local',
            paymentMethod: saleData.payMethod,
            cashierDocument: saleData.cashier_document || 'Sin asignar',
            buyerName: saleData.buyer_name || 'Cliente general',
            buyerEmail: saleData.buyer_email || '',
            buyerPhone: saleData.buyer_phone || '',
            type: 'Venta Local (Pago con GiftCard)',
            isMainPayment: true,
            totalReceiptAmount: parseFloat(saleData.total_amount || 0),
            id_orderDetail: saleData.OrderDetail?.id_orderDetail || null
          };
          formattedLocalSales.push(mainPayment);
        }
        
        return; // Ya procesamos este receipt
      }
      
      // ✅ VENTAS NORMALES (sin GiftCard)
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
          date: sale.date, // ✅ Usar date para consistencia
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

      // ✅ CORRECCIÓN: Usar la fecha del Receipt si existe, sino usar createdAt de la reserva
      const paymentDate = reservation.OrderDetail?.Receipt?.date || reservation.createdAt;

      return {
        id: `reservation-${reservation.id_reservation}`,
        date: paymentDate, // ✅ USAR FECHA DEL RECIBO
        amount: parseFloat(reservation.partialPayment || 0), // ✅ SOLO EL PAGO INICIAL
        pointOfSale: 'Local',
        paymentMethod: reservation.paymentMethod || 'Efectivo', // ✅ USAR EL MÉTODO DE PAGO DE LA RESERVA
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
        paymentMethod: payment.paymentMethod || 'Efectivo',
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

    // ✅ Depósitos Addi/Sistecredito (ingresos reales separados de ventas)
    const formattedDeposits = addiSistecreditoDeposits.map(deposit => ({
      id: `deposit-${deposit.id}`,
      date: deposit.depositDate,
      amount: parseFloat(deposit.amount || 0),
      platform: deposit.platform,
      referenceNumber: deposit.referenceNumber || 'Sin referencia',
      description: deposit.description || `Depósito ${deposit.platform}`,
      status: deposit.status,
      notes: deposit.notes
    }));

    console.log(`✅ Total ventas locales formateadas: ${formattedLocalSales.length}`);
    console.log(`✅ Total pagos de reservas formateados: ${formattedReservationPayments.length}`);
    console.log(`✅ Total depósitos Addi/Sistecredito: ${formattedDeposits.length}`);
    console.log(`✅ Total pagos parciales formateados: ${formattedPartialPayments.length}`);

    // ✅ PASO 7: CALCULAR TOTALES POR MÉTODO DE PAGO
    console.log("📊 Calculando totales por método de pago...");

    // ✅ Combinar todos los pagos locales
    const allLocalPayments = [
      ...formattedLocalSales,
      ...formattedReservationPayments,
      ...formattedPartialPayments
    ];

    // ✅ Función para calcular ingresos por método (con soporte para variantes)
    const calculateIncomeByMethod = (method) => {
      return allLocalPayments
        .filter(payment => {
          // Para GiftCards, usar el método real del Payment si existe
          const paymentMethod = payment.actualPaymentMethod || payment.paymentMethod;
          
          // ✅ MANEJO ESPECIAL: "Tarjeta" incluye "Tarjeta de Débito" y "Tarjeta de Crédito"
          if (method === "Tarjeta") {
            return paymentMethod === "Tarjeta" || 
                   paymentMethod === "Tarjeta de Débito" || 
                   paymentMethod === "Tarjeta de Crédito";
          }
          
          return paymentMethod === method;
        })
        .reduce((acc, payment) => acc + (payment.amount || 0), 0);
    };

    // ✅ Calcular totales por cada método
    const ingresosEfectivo = calculateIncomeByMethod("Efectivo");
    const ingresosTarjeta = calculateIncomeByMethod("Tarjeta"); // Incluye Débito y Crédito
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
    const totalDeposits = formattedDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
    
    // ✅ Para el balance, excluir Addi y Sistecredito (GiftCard ya está filtrado arriba)
    const totalLocalSalesForBalance = allLocalPayments
      .filter(payment => {
        const paymentMethod = payment.actualPaymentMethod || payment.paymentMethod;
        return !['Addi', 'Sistecredito'].includes(paymentMethod);
      })
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // ✅ Ingresos totales = ventas + depósitos (los depósitos son dinero real que ingresa)
    const totalIncome = totalOnlineSales + totalLocalSalesForBalance + totalDeposits;
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
      totalDeposits: totalDeposits.toFixed(2),
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
      totalDeposits: parseFloat(totalDeposits.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      
      income: {
        online: formattedOnlineSales,
        local: allLocalPayments
      },

      deposits: formattedDeposits,
      
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
        giftCard: parseFloat(ingresosGiftCard.toFixed(2)), // ✅ Ahora solo incluye GiftCards COMPRADAS
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