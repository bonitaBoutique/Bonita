const { OrderDetail } = require("../data");

module.exports = async (req, res) => {
  try {
    const { event, data } = req.body;

    // Verifica si el evento es una actualización de la transacción
    if (event === 'transaction.updated') {
      const transaction = data.transaction;

      // Encuentra la orden en la base de datos usando el campo 'integritySignature'
      const orderDetail = await OrderDetail.findOne({ where: { integritySignature: transaction.id_orderDetail } });

      if (!orderDetail) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Actualiza el estado de la orden basado en el estado de la transacción
      if (transaction.status === 'APPROVED') {
        orderDetail.transaction_status = 'Aprobado'; // Cambia el estado a 'Aprobado'
      } else if (transaction.status === 'DECLINED') {
        orderDetail.transaction_status = 'Rechazado'; // Cambia el estado a 'Rechazado'
      } else if (transaction.status === 'PENDING') {
        orderDetail.transaction_status = 'Pendiente'; // Cambia el estado a 'Pendiente'
      }

      // Guarda los cambios en la base de datos
      await orderDetail.save();

      // Responde a Wompi indicando que la notificación fue recibida y procesada correctamente
      return res.status(200).json({ message: 'Order updated' });
    } else {
      return res.status(400).json({ error: 'Unknown event' });
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    return res.status(500).json({ error: error.message });
  }
};


