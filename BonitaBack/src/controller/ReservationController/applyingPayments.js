const { Reservation, CreditPayment, OrderDetail } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { id_reservation } = req.params;
  const { amount } = req.body;

  try {
    const reservation = await Reservation.findByPk(id_reservation, {
      include: OrderDetail
    });

    if (!reservation) {
      return response(res, 404, { error: "Reservation not found" });
    }

    // Create a new payment record
    await CreditPayment.create({
      id_reservation,
      amount,
    });

    // Update total paid amount
    reservation.totalPaid += amount;

    // Check if total payments equal the order amount
    if (reservation.totalPaid >= reservation.OrderDetail.amount) {
      reservation.OrderDetail.status = "completada";
    }

    // Save changes
    await reservation.save();
    await reservation.OrderDetail.save();

    return response(res, 200, { reservation });
  } catch (error) {
    console.error("Error applying payment:", error);
    return response(res, 500, { error: "Internal server error" });
  }
};