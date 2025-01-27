const { Reservation, OrderDetail, User } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { n_document } = req.params;
  console.log('Searching reservations for document:', n_document);

  try {
    const reservations = await Reservation.findAll({
      where: { n_document },
      include: [{
        model: OrderDetail,
        include: [{
          model: User,
          attributes: ['first_name', 'last_name', 'email', 'phone']
        }]
      }],
      logging: console.log
    });

    console.log('Found reservations:', JSON.stringify(reservations, null, 2));

    if (!reservations.length) {
      return response(res, 404, { error: "No reservations found" });
    }

    return response(res, 200, { reservations });

  } catch (error) {
    console.error('Error details:', error);
    return response(res, 500, { error: "Internal server error" });
  }
};