const { Receipt, OrderDetail, Product, Payment } = require("../../data");
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
  } = req.body;

  // ✅ LOGS DE FECHA
  console.log('🕒 [CREATE RECEIPT] Fecha del cliente:', date);
  console.log('🕒 [CREATE RECEIPT] Fecha del servidor (Colombia):', serverDate);

  // Validaciones iniciales
  const validPayMethods = [
    "Efectivo",
    "Sistecredito",
    "Addi",
    "Tarjeta",
    "Crédito",
    "Bancolombia",
    "Otro",
    "GiftCard",
    "Nequi"
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

  // Lógica para GiftCard (saldo a favor)
  if (payMethod === "GiftCard") {
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
        amount2: null,
        payMethod2: null,
        receipt_number: receiptNumber,
        cashier_document,
      });

      // Crear el Payment asociado
       await Payment.create({
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

      console.log('🟢 [CREATE RECEIPT] GiftCard creado con fecha del cliente:', {
        receiptNumber,
        clientDate: date,
        finalDate: formatDateForDB(date || serverDate),
        serverDate: serverDate,
        timezone: 'America/Bogota'
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

    return res.status(201).json({
      message: "Recibo creado exitosamente",
      receipt,
      products: order.products || [],
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
