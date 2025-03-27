const { OrderDetail } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { id_orderDetail } = req.params;
  const { state_order, trackingNumber, transaction_status, shipping_status, status } = req.body;

  try {
    const orderDetail = await OrderDetail.findByPk(id_orderDetail);

    if (!orderDetail) {
      return response(res, 404, { error: "Order Detail not found" });
    }

    // Order state validation
    const validStatesOrder = [
      "Pedido Realizado",
      "En Preparación",
      "Listo para entregar",
      "Envío Realizado",
      "Retirado",
    ];
    if (state_order && !validStatesOrder.includes(state_order)) {
      return response(res, 400, { error: "Invalid state_order value" });
    }

    // Wompi transaction state validation
    const validTransactionStates = [
      "Pendiente",
      "Aprobado",
      "Rechazado",
      "Fallido",
      "Cancelado",
    ];
    if (transaction_status && !validTransactionStates.includes(transaction_status)) {
      return response(res, 400, { error: "Invalid transaction_status value" });
    }

    // Mipaquete shipping state validation
    const validShippingStates = [
      "Envío pendiente por pago",
      "Procesando tu envío",
      "Envío programado",
      "En ruta",
      "Entregado",
      "Cancelado"
    ];
    if (shipping_status && !validShippingStates.includes(shipping_status)) {
      return response(res, 400, { error: "Invalid shipping_status value" });
    }

    // Status validation
    const validStatuses = ["pendiente", "facturada", "cancelada", "completada"];
    if (status && !validStatuses.includes(status)) {
      return response(res, 400, { error: "Invalid status value" });
    }

    // Update order details
    if (state_order) orderDetail.state_order = state_order;
    if (transaction_status) orderDetail.transaction_status = transaction_status;
    if (shipping_status) orderDetail.shipping_status = shipping_status;
    if (trackingNumber) orderDetail.tracking_number = trackingNumber;
    if (status) orderDetail.status = status;

    await orderDetail.save();

    return response(res, 200, { orderDetail });
  } catch (error) {
    return response(res, 500, { error: error.message });
  }
};
