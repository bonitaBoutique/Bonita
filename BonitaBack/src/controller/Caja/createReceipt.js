const { Receipt, OrderDetail, Product, Payment, GiftCard } = require("../../data");
const { formatDateForDB, getColombiaDate } = require("../../utils/dateUtils"); // ✅ IMPORTAR getColombiaDate

module.exports = async (req, res) => {
  // ✅ OBTENER FECHA DEL SERVIDOR
  const serverDate = getColombiaDate();
  
  const {
    id_orderDetail,
    buyer_name,
    buyer_email,
    buyer_phone,
    total_amount,
    date, // ✅ Fecha del cliente (para logging)
    payMethod,
    amount,
    amount2,
    payMethod2,
    cashier_document,
    actualPaymentMethod,
    discount = 0,
    // ✅ NUEVOS CAMPOS: Para pago con GiftCard
    giftCardEmail,
    giftCardBalance,
  } = req.body;

  // ✅ LOGS DE FECHA
  console.log('🕒 [CREATE RECEIPT] Fecha del cliente:', date);
  console.log('🕒 [CREATE RECEIPT] Fecha del servidor (Colombia):', serverDate);

  // Validaciones iniciales
  const validPayMethods = [
    "Efectivo",
    "Tarjeta de Crédito",
    "Tarjeta de Débito",
    "Transferencia",
    "Nequi",
    "Daviplata",
    "Sistecredito",
    "Addi",
    "Bancolombia",
    "GiftCard",
    "Crédito",
    "Otro"
  ];

  if (
    (!id_orderDetail && payMethod !== "GiftCard") ||
    !buyer_name ||
    !buyer_email ||
    !total_amount ||
    !payMethod
  ) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  // Validar el formato del correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(buyer_email)) {
    return res.status(400).json({ message: "El email no tiene un formato válido" });
  }

  // Validar métodos de pago
  if (!validPayMethods.includes(payMethod)) {
    return res.status(400).json({ message: "El método de pago no es válido" });
  }
  if (payMethod2 && !validPayMethods.includes(payMethod2)) {
    return res.status(400).json({ message: "El segundo método de pago no es válido" });
  }

  // Lógica para GiftCard (saldo a favor) - SOLO cuando NO hay orden (es compra de GiftCard)
  console.log('🔍 [DEBUG] Evaluando condición GiftCard:', { 
    payMethod, 
    id_orderDetail, 
    shouldCreateNew: payMethod === "GiftCard" && !id_orderDetail 
  });
  
  if (payMethod === "GiftCard" && !id_orderDetail) {
    try {
      const lastReceipt = await Receipt.findOne({
        order: [["id_receipt", "DESC"]],
      });
      const receiptNumber = lastReceipt ? lastReceipt.id_receipt + 1 : 1001;

      const receipt = await Receipt.create({
        buyer_name,
        buyer_email,
        buyer_phone,
        total_amount,
        date: formatDateForDB(date || serverDate), // ✅ Usar fecha del cliente, fallback al servidor
        payMethod: "GiftCard",
        amount,
        amount2: amount2 || null,
        payMethod2: payMethod2 || null,
        receipt_number: receiptNumber,
        cashier_document,
      });

      // Crear el Payment asociado
       await Payment.create({
        id_receipt: receipt.id_receipt, // ✅ ASOCIAR Payment con Receipt
        buyer_name,
        buyer_email,
        buyer_phone,
        amount,
        payMethod: actualPaymentMethod,
        payment_state: "Pago",
        date: formatDateForDB(date || serverDate), // ✅ Usar fecha del cliente, fallback al servidor
        receipt_number: receiptNumber,
        cashier_document,
      });

      // 🎁 CREAR REGISTRO EN TABLA GIFTCARD (COMPRA - SUMA SALDO)
      // ✅ PROTECCIÓN: Verificar si ya existe una GiftCard para este recibo
      const existingGiftCard = await GiftCard.findOne({
        where: {
          id_receipt: receipt.id_receipt
        }
      });

      if (!existingGiftCard) {
        await GiftCard.create({
          buyer_email,
          buyer_name,
          buyer_phone,
          saldo: amount,
          id_receipt: receipt.id_receipt,
          payment_method: actualPaymentMethod,
          description: `Compra de GiftCard - Recibo ${receipt.id_receipt}`,
          reference_id: String(receipt.id_receipt),
          reference_type: 'PURCHASE'
        });
        console.log('✅ GiftCard creada para recibo:', receipt.id_receipt);
      } else {
        console.log('⚠️ GiftCard ya existe para recibo:', receipt.id_receipt);
      }

      console.log('🟢 [CREATE RECEIPT] GiftCard COMPRADA - creado con fecha del cliente:', {
        receiptNumber,
        clientDate: date,
        finalDate: formatDateForDB(date || serverDate),
        serverDate: serverDate,
        timezone: 'America/Bogota',
        giftCardAmount: amount,
        buyerEmail: buyer_email
      });

      return res.status(201).json({
        message: "Recibo de GiftCard creado exitosamente",
        receipt,
        products: [],
        serverInfo: {
          clientDate: date,
          serverDate: serverDate,
          timezone: 'America/Bogota'
        }
      });
    } catch (error) {
      console.error("❌ [CREATE RECEIPT] Error al crear el recibo GiftCard:", error.message);
      return res.status(500).json({ message: "Error al crear el recibo GiftCard" });
    }
  }

  // Lógica para recibos normales (con orden)
  try {
    // Buscar la orden de compra junto con los productos relacionados
    const order = await OrderDetail.findByPk(id_orderDetail, {
      include: {
        model: Product,
        as: "products",
        through: { attributes: [] },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (order.status === "facturada") {
      return res.status(400).json({ message: "La orden ya ha sido facturada" });
    }

    if (order.status === "cancelada") {
      return res.status(400).json({ message: "La orden está cancelada y no se puede facturar" });
    }

    // Actualizar el descuento en la orden
    order.discount = discount;
    await order.save();

    // Calcular el total con descuento
    const totalConDescuento = order.amount - (order.amount * discount / 100);

    // Buscar el último recibo para obtener el número de recibo más alto
    const lastReceipt = await Receipt.findOne({
      order: [["id_receipt", "DESC"]],
    });

    const receiptNumber = lastReceipt ? lastReceipt.id_receipt + 1 : 1001;

    const receipt = await Receipt.create({
      id_orderDetail,
      buyer_name,
      buyer_email,
      buyer_phone,
      total_amount: totalConDescuento,
      date: formatDateForDB(date || serverDate), // ✅ Usar fecha del cliente, fallback al servidor
      payMethod,
      amount,
      amount2: amount2 || null,
      payMethod2: payMethod2 || null,
      receipt_number: receiptNumber,
      cashier_document,
      discount,
    });

    console.log('🟢 [CREATE RECEIPT] Recibo creado con fecha del cliente:', {
      receiptNumber,
      clientDate: date,
      finalDate: formatDateForDB(date || serverDate),
      serverDate: serverDate,
      timezone: 'America/Bogota'
    });

    // ✅ NUEVA LÓGICA: Descontar automáticamente de GiftCard(s) si es el método de pago
    let giftCardUpdated = null;
    if ((payMethod === "GiftCard" || payMethod2 === "GiftCard") && giftCardEmail) {
      try {
        console.log('🎁 [GIFT CARD PAYMENT] Descontando del saldo consolidado...');
        
        // Buscar TODAS las GiftCards activas del usuario, ordenadas por antigüedad
        const giftCards = await GiftCard.findAll({ 
          where: { buyer_email: giftCardEmail, estado: 'activa' },
          order: [['createdAt', 'ASC']] // Usar las más antiguas primero
        });

        if (!giftCards || giftCards.length === 0) {
          throw new Error('No hay GiftCards activas para este email');
        }

        // ✅ DETERMINAR: Monto a descontar según si es método primario o secundario
        const amountToDeduct = payMethod === "GiftCard" ? amount : amount2;
        
        // Calcular saldo total disponible
        const saldoTotal = giftCards.reduce((total, gc) => total + (gc.saldo || 0), 0);
        
        if (saldoTotal < amountToDeduct) {
          throw new Error(`Saldo insuficiente. Disponible: ${saldoTotal}, Requerido: ${amountToDeduct}`);
        }

        // Descontar el monto desde las GiftCards (empezando por las más antiguas)
        let montoRestante = amountToDeduct;
        const giftCardsAfectadas = [];
        
        for (const giftCard of giftCards) {
          if (montoRestante <= 0) break;
          
          const saldoAnterior = giftCard.saldo;
          
          if (giftCard.saldo >= montoRestante) {
            // Esta GiftCard tiene suficiente saldo
            giftCard.saldo -= montoRestante;
            montoRestante = 0;
          } else {
            // Usar todo el saldo de esta GiftCard y continuar con la siguiente
            montoRestante -= giftCard.saldo;
            giftCard.saldo = 0;
          }
          
          // Si el saldo quedó en 0, marcar como usada
          if (giftCard.saldo === 0) {
            giftCard.estado = 'usada';
          }
          
          await giftCard.save();
          
          giftCardsAfectadas.push({
            id_giftcard: giftCard.id_giftcard,
            saldoAnterior,
            saldoNuevo: giftCard.saldo,
            descontado: saldoAnterior - giftCard.saldo,
            estado: giftCard.estado
          });
        }

        // Calcular nuevo saldo total
        const nuevoSaldoTotal = giftCards.reduce((total, gc) => total + (gc.saldo || 0), 0);
        
        giftCardUpdated = {
          email: giftCardEmail,
          montoDescontado: amountToDeduct,
          saldoAnterior: saldoTotal,
          saldoActual: nuevoSaldoTotal,
          giftCardsAfectadas
        };

        console.log('✅ [GIFT CARD PAYMENT] Descuento consolidado exitoso:', giftCardUpdated);
      } catch (giftCardError) {
        console.error('❌ [GIFT CARD PAYMENT] Error:', giftCardError.message);
        // No fallar el recibo por error de GiftCard, pero loggearlo
      }

      // ✅ NUEVO: Si hay un método de pago secundario, crear el Payment correspondiente
      if (payMethod2 && amount2 && amount2 > 0) {
        try {
          console.log(`💳 [SECONDARY PAYMENT] Creando Payment para método secundario: ${payMethod2}, monto: ${amount2}`);
          
          await Payment.create({
            id_receipt: receipt.id_receipt,
            amount: amount2,
            payMethod: payMethod2,
            payment_state: "Pago",
            date: formatDateForDB(date || serverDate),
          });
          
          console.log('✅ [SECONDARY PAYMENT] Payment secundario creado exitosamente');
        } catch (secondPaymentError) {
          console.error('❌ [SECONDARY PAYMENT] Error al crear Payment secundario:', secondPaymentError.message);
        }
      }
    }

    return res.status(201).json({
      message: "Recibo creado exitosamente",
      receipt,
      products: order.products || [],
      giftCardUpdate: giftCardUpdated, // ✅ INCLUIR: información de GiftCard actualizada
      serverInfo: {
        clientDate: date,
        serverDate: serverDate,
        timezone: 'America/Bogota'
      }
    });

  } catch (error) {
    console.error("❌ [CREATE RECEIPT] Error al crear el recibo:", error.message);
    return res.status(500).json({ message: "Error al crear el recibo" });
  }
};
