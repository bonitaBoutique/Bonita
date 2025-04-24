const { Receipt, OrderDetail, Product } = require("../../data");

module.exports = async (req, res) => {
  const {
    id_orderDetail,
    buyer_name,
    buyer_email,
    buyer_phone,
    total_amount,
    date,
    payMethod,
    amount2,        
    payMethod2,     
    cashier_document
  } = req.body;

  // Validaciones iniciales
  if (!id_orderDetail || !buyer_name || !buyer_email || !total_amount || !date || !payMethod) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  // Validar el formato del correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(buyer_email)) {
    return res.status(400).json({ message: "El email no tiene un formato válido" });
  }

  // Validar que el payMethod sea uno de los valores permitidos
  const validPayMethods = ["Efectivo", "Sistecredito", "Addi", "Tarjeta", "Crédito", "Bancolombia", "Otro"];
  if (!validPayMethods.includes(payMethod)) {
    return res.status(400).json({ message: "El método de pago no es válido" });
  }

  if (payMethod2 && !validPayMethods.includes(payMethod2)) {
    return res.status(400).json({ message: "El segundo método de pago no es válido" });
  }
  
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

    // Buscar el último recibo para obtener el número de recibo más alto
    const lastReceipt = await Receipt.findOne({
      order: [["id_receipt", "DESC"]],
    });

    const receiptNumber = lastReceipt ? lastReceipt.id_receipt + 1 : 1001;

    // Crear el nuevo recibo con ambos métodos de pago si existen
    const receipt = await Receipt.create({
      id_orderDetail,
      buyer_name,
      buyer_email,
      buyer_phone,
      total_amount: order.amount,
      date,
      payMethod,
      amount2: amount2 || null,         // <-- Nuevo
      payMethod2: payMethod2 || null,   // <-- Nuevo
      receipt_number: receiptNumber,
      cashier_document,
    });

    return res.status(201).json({
      message: "Recibo creado exitosamente",
      receipt,
      products: order.products,
    });
  } catch (error) {
    console.error("Error al crear el recibo:", error.message);
    return res.status(500).json({ message: "Error al crear el recibo" });
  }
};




