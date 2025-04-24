const { Reservation, OrderDetail, User } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    console.log('Fetching all reservations...');
    const reservations = await Reservation.findAll({
      include: [
        {
          model: OrderDetail,
          attributes: ['amount'],
          include: [
            {
              model: User,
              attributes: ['first_name', 'last_name', 'email', 'phone']
            }
          ]
        }
      ],
      logging: console.log
    });

    console.log('Found reservations:', JSON.stringify(reservations, null, 2));

   
    return response(res, 200, { reservations });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return response(res, 500, { error: "Internal server error" });
  }
};