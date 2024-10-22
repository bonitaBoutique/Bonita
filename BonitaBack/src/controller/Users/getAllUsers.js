const { User } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    console.log("Fetching all users...");
    const users = await User.findAll();
    console.log("Users fetched successfully: ", users);
    response(res, 200, users);
  } catch (error) {
    console.error("Error al obtener los usuarios: ", error);
    response(res, 500, "Error al obtener los usuarios");
  }
};

