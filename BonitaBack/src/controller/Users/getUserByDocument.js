const { User } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const nDocument = req.params.n_document;

    const user = await User.findOne({ where: { n_document: nDocument } });

    if (!user) {
      return response(res, 404, "Usuario no encontrado");
    }

    response(res, 200, user);
  } catch (error) {
    console.error(error);
    response(res, 500, "Error al obtener el usuario");
  }
};


