module.exports = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return response(res, 400, "Email y contraseña son obligatorios");
    }

    // Normalizar email a minúsculas
    email = email.toLowerCase();

    // Buscar usuario por email (ya en minúsculas)
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
      { id: user.id, role: user.role, n_document: user.n_document },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    response(res, 200, { message: "Autenticación exitosa", token, n_document: user.n_document });
  } catch (error) {
    console.error(error);
    response(res, 500, "Error al autenticar el usuario");
  }
};

