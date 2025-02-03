const { Receipt, OrderDetail } = require("../../data");

module.exports = async (req, res) => {
  const { id_orderDetail, buyer_name, buyer_email, buyer_phone, total_amount, date, payMethod } = req.body;

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
  const validPayMethods = ["Efectivo","Crédito", "Sistecredito", "Addi", "Tarjeta", "Bancolombia", "Combinado"];
  if (!validPayMethods.includes(payMethod)) {
    return res.status(400).json({ message: "El método de pago no es válido" });
  }

  try {
    // Buscar la orden de compra
    const order = await OrderDetail.findByPk(id_orderDetail);

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
      order: [['id_receipt', 'DESC']],  // Orden descendente para obtener el último recibo
    });

    // Si no existe ningún recibo, asignamos el número de recibo a 1
    const receiptNumber = lastReceipt ? lastReceipt.id_receipt + 1 : 1001;

    // Crear el nuevo recibo con el número adecuado y el método de pago
    const receipt = await Receipt.create({
      id_orderDetail,
      buyer_name,
      buyer_email,
      buyer_phone,
      total_amount: order.amount,
      date,
      payMethod,  // Guardamos el método de pago
      receipt_number: receiptNumber,
    });

    // Actualizar el estado de la orden
    order.status = "facturada";
    await order.save();

    return res.status(201).json({ message: "Recibo creado exitosamente", receipt });
  } catch (error) {
    console.error("Error al crear el recibo:", error.message);
    return res.status(500).json({ message: "Error al crear el recibo" });
  }
};




