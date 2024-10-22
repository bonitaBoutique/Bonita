const { User } = require("../../data");
const response = require("../../utils/response");
const bcrypt = require("bcrypt");

module.exports = async (req, res) => {
  try {
    const nDocument = req.params.n_document; // Corregido a n_document
    const userUpdates = req.body;

    if (userUpdates.password) {
      userUpdates.password = await bcrypt.hash(userUpdates.password, 10);
    }

    const [updatedRowsCount] = await User.update(userUpdates, { where: { n_document: nDocument } });

    if (updatedRowsCount === 0) {
      return response(res, 404, "Usuario no encontrado");
    }

    response(res, 200, "Usuario actualizado con éxito");
  } catch (error) {
    console.error(error);
    response(res, 500, "Error al actualizar el usuario");
  }
};

