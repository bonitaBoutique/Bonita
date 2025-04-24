const { User } = require("../../data");
const response = require("../../utils/response");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return response(res, 400, "Email y contraseña son obligatorios");
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return response(res, 404, "Usuario no encontrado");
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return response(res, 401, "Contraseña incorrecta");
    }

    // Crear token
    const token = jwt.sign(
      { id: user.id, role: user.role, n_document: user.n_document }, // Incluir n_document en el payload del token
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    response(res, 200, { message: "Autenticación exitosa", token, n_document: user.n_document });
  } catch (error) {
    console.error(error);
    response(res, 500, "Error al autenticar el usuario");
  }
};

