const { Reservation, CreditPayment, OrderDetail, User } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { id_reservation } = req.params;
  const { amount } = req.body;

  console.log("Received request to apply payment:", { id_reservation, amount });

  try {
    // ✅ INCLUIR User en la consulta de la reserva
    const reservation = await Reservation.findByPk(id_reservation, {
      include: [{
        model: OrderDetail,
        include: [{
          model: User,
          attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone']
        }]
      }]
    });

    if (!reservation) {
      return response(res, 404, { error: "Reservation not found" });
    }

    // ✅ Si no hay User asociado en OrderDetail, buscar por n_document como en tu otro controlador
    let user = reservation.OrderDetail.User;
    if (!user && reservation.OrderDetail.n_document) {
      user = await User.findOne({
        where: { n_document: reservation.OrderDetail.n_document },
        attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone']
      });
    }

    // Create a new payment record
    await CreditPayment.create({
      id_reservation,
      amount,
    });

    // Update total paid amount
    reservation.totalPaid += amount;

    // ✅ Check if total payments equal the order amount and update RESERVATION status
    if (reservation.totalPaid >= reservation.OrderDetail.amount) {
      reservation.status = "Completada"; // ✅ CORREGIDO: actualizar el estado de la Reservation
      console.log(`✅ Reserva completada: ${id_reservation} - Total pagado: $${reservation.totalPaid}`);
    }

    // Save changes
    await reservation.save();
    // No es necesario guardar OrderDetail ya que no se modificó

    // ✅ INCLUIR la información del usuario en la respuesta
    const responseData = {
      ...reservation.toJSON(),
      OrderDetail: {
        ...reservation.OrderDetail.toJSON(),
        User: user ? {
          n_document: user.n_document,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone
        } : null
      }
    };

    console.log("✅ Payment applied successfully with user data:", {
      reservationId: id_reservation,
      userName: user ? `${user.first_name} ${user.last_name}` : 'Usuario no encontrado'
    });

    return response(res, 200, { reservation: responseData });
  } catch (error) {
    console.error("Error applying payment:", error);
    return response(res, 500, { error: "Internal server error" });
  }
};