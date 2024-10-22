const { OrderDetail } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { id_orderDetail } = req.params;
  const { state_order, trackingNumber, transaction_status } = req.body;

  try {
    const orderDetail = await OrderDetail.findByPk(id_orderDetail);

    if (!orderDetail) {
      return response(res, 404, { error: "Order Detail not found" });
    }

    // Verificar si el valor del estado de la orden es válido
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

    const validTransactionStates = [
      "Pendiente",
      "Aprobado",
      "Rechazado",
      "Fallido",
      "Cancelado",
    ];
    if (
      transaction_status &&
      !validTransactionStates.includes(transaction_status)
    ) {
      return response(res, 400, { error: "Invalid transaction_status value" });
    }

    
    if (state_order) {
      orderDetail.state_order = state_order;
    }

   
    if (trackingNumber) {
      orderDetail.trackingNumber = trackingNumber;
    }

    
    if (transaction_status) {
      orderDetail.transaction_status = transaction_status;
    }

    
    await orderDetail.save();

    return response(res, 200, { orderDetail });
  } catch (error) {
    console.error("Error updating order detail:", error);
    return response(res, 500, { error: error.message });
  }
};

