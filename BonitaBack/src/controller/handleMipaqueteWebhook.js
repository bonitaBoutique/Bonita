const { OrderDetail } = require("../data");

const handleMipaqueteWebhook = async (req, res) => {
  try {
    const { state, tracking, id_orderDetail } = req.body;

    if (!id_orderDetail) {
      return res.status(400).json({ error: 'Missing id_orderDetail in request body' });
    }

    const orderDetail = await OrderDetail.findOne({ where: { id_orderDetail } });

    if (!orderDetail) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Actualiza el estado y la información de seguimiento
    orderDetail.shipping_status = state;
    orderDetail.tracking_number = tracking[tracking.length - 1]?.updateState || null;
    
    await orderDetail.save();

    return res.status(200).send('Webhook received');
  } catch (error) {
    console.error("Error handling webhook:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  handleMipaqueteWebhook,
};