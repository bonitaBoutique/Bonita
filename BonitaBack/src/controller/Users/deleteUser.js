const { User } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const nDocument = req.params.n_document; // Corregido a n_document

    const deletedUser = await User.destroy({ where: { n_document: nDocument } });

    if (!deletedUser) {
      return response(res, 404, "Usuario no encontrado");
    }

    response(res, 200, "Usuario eliminado con éxito");
  } catch (error) {
    console.error(error);
    response(res, 500, "Error al eliminar el usuario");
  }
};



