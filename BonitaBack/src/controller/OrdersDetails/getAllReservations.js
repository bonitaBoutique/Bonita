const { Reservation, OrderDetail } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: OrderDetail,
          as: 'orderDetail',
          attributes: ['id_orderDetail', 'amount', 'state_order', 'date']
        }
      ]
    });
    return response(res, 200, { reservations });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return response(res, 500, { error: "Internal server error" });
  }
};