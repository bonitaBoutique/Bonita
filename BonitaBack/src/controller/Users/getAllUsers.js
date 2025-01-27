const { User, OrderDetail } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    console.log("Fetching all users...");
    const users = await User.findAll({
      include: [
        {
         
          model: OrderDetail, 
          as: 'OrderDetails', // Update alias to match the association
          attributes: ['id_orderDetail', 'amount', 'state_order', 'date'],
        },
      ],
    });
    console.log("Users fetched successfully: ", JSON.stringify(users, null, 2));
    response(res, 200, users);
  } catch (error) {
    console.error("Error al obtener los usuarios: ", error);
    response(res, 500, { error: "Error al obtener los usuarios" });
  }
};