const { Receipt, OrderDetail, sequelize } = require("../../data");

module.exports = async (req, res) => {
  const { id_orderDetail, buyer_name, buyer_email, buyer_phone, total_amount, date } = req.body;

  // Validaciones iniciales
  if (!id_orderDetail || !buyer_name || !buyer_email || !total_amount || !date ) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(buyer_email)) {
    return res.status(400).json({ message: "El email no tiene un formato válido" });
  }

  const t = await sequelize.transaction();
  try {
    // Buscar la orden de compra
    const order = await OrderDetail.findByPk(id_orderDetail, { transaction: t });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (!order.isFacturable) {
      await t.rollback();
      return res.status(400).json({ message: "La orden no es facturable" });
    }

    if (order.status === "facturada") {
      await t.rollback();
      return res.status(400).json({ message: "La orden ya ha sido facturada" });
    }

    if (order.status === "cancelada") {
      await t.rollback();
      return res.status(400).json({ message: "La orden está cancelada y no se puede facturar" });
    }

    // Buscar el último recibo para obtener el número de recibo más alto
    const lastReceipt = await Receipt.findOne({
      order: [['id_receipt', 'DESC']],  // Orden descendente para obtener el último recibo
    });

    // Si no existe ningún recibo, asignamos el número de recibo a 1
    const receiptNumber = lastReceipt ? lastReceipt.id_receipt + 1 : 1001;

    // Crear el nuevo recibo con el número adecuado
    const receipt = await Receipt.create(
      {
        id_orderDetail,
        buyer_name,
        buyer_email,
        buyer_phone,
        total_amount: order.amount,
        date,  // El número de documento lo provee el usuario
        receipt_number: receiptNumber, // Asignamos el número de recibo generado automáticamente
      },
      { transaction: t }
    );

    // Actualizar el estado de la orden
    order.status = "facturada";
    await order.save({ transaction: t });

    await t.commit();
    return res.status(201).json({ message: "Recibo creado exitosamente", receipt });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear el recibo:", error.message);
    return res.status(500).json({ message: "Error al crear el recibo" });
  }
};


