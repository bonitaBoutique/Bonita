const { Reservation } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { id_reservation } = req.params;
  const { partialPayment, status, dueDate } = req.body;

  try {
    const reservation = await Reservation.findByPk(id_reservation);

    if (!reservation) {
      return response(res, 404, { error: "Reservation not found" });
    }

    // Validate status
    const validStates = ["Pendiente", "Completada", "Cancelada"];
    if (status && !validStates.includes(status)) {
      return response(res, 400, { error: "Invalid status" });
    }

    // Update fields
    if (partialPayment !== undefined) reservation.partialPayment = partialPayment;
    if (status !== undefined) reservation.status = status;
    if (dueDate !== undefined) reservation.dueDate = dueDate;

    // Save changes
    await reservation.save();

    return response(res, 200, { reservation });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return response(res, 500, { error: "Internal server error" });
  }
};