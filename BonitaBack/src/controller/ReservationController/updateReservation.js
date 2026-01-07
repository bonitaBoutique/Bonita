const { Reservation, CreditPayment, OrderDetail } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { id_reservation } = req.params;
  const { partialPayment, status, dueDate, paymentMethod } = req.body;

  try {
    const reservation = await Reservation.findByPk(id_reservation, {
      include: OrderDetail
    });

    if (!reservation) {
      return response(res, 404, { error: "Reservation not found" });
    }

    // Validate status
    const validStates = ["pendiente", "completada", "cancelada"];
    if (status && !validStates.includes(status)) {
      return response(res, 400, { error: "Invalid status" });
    }

    // Update fields
    if (partialPayment !== undefined) {
      // Create a new payment record
      await CreditPayment.create({
        id_reservation,
        amount: partialPayment,
        paymentMethod: paymentMethod || 'Efectivo',
      });

      // Update total paid amount
      reservation.totalPaid += partialPayment;

      // Check if total payments equal the order amount
      if (reservation.totalPaid >= reservation.OrderDetail.amount) {
        reservation.OrderDetail.status = "completada";
      }
    }
    if (status !== undefined) reservation.status = status;
    if (dueDate !== undefined) reservation.dueDate = dueDate;

    // Save changes
    await reservation.save();
    await reservation.OrderDetail.save();

    return response(res, 200, { reservation });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return response(res, 500, { error: "Internal server error" });
  }
};