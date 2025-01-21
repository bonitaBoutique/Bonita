const { Reservation, OrderDetail } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { id_orderDetail } = req.params;
  const { partialPayment, dueDate } = req.body;

  try {
    const order = await OrderDetail.findByPk(id_orderDetail);

    if (!order) {
      return response(res, 404, { error: "Order not found" });
    }

    // Create new reservation
    const reservation = await Reservation.create({
      id_orderDetail,
      partialPayment,
      totalPaid: partialPayment,
      dueDate,
      status: "Pendiente"
    });

    return response(res, 201, { reservation });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return response(res, 500, { error: "Internal server error" });
  }
};