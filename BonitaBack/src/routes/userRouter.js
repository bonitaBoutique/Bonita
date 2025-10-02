const express = require("express");
const router = express.Router();
const {
  createUsers,
  putUser,
  deleteUser,
  getAllUsers,
  getUserByDocument
} = require("../controller/Users");
const { authenticate, authorize } = require("../controller/Users/authMiddleware");

// Ruta para crear usuario
router.post("/", createUsers);

// Ruta para actualizar usuario
router.put("/:n_document", authenticate, authorize(['Admin', 'User']), putUser);

// Ruta para eliminar usuario
router.delete("/:n_document", authenticate, authorize(['Admin']), deleteUser);

// Ruta para obtener todos los usuarios
router.get("/", getAllUsers);

// Ruta para validar si un documento de usuario existe (para validación de cajeros)
router.get("/validate/:n_document", async (req, res) => {
  try {
    const { n_document } = req.params;
    const { User } = require("../data");
    
    const user = await User.findOne({
      where: { n_document },
      attributes: ['n_document', 'first_name', 'last_name', 'role']
    });

    if (user) {
      return res.json({
        exists: true,
        user: user.toJSON()
      });
    } else {
      return res.json({
        exists: false,
        user: null
      });
    }
  } catch (error) {
    console.error("Error validando documento:", error);
    return res.status(500).json({
      exists: false,
      error: "Error interno del servidor"
    });
  }
});

// Ruta para obtener un usuario por documento
router.get("/:n_document", getUserByDocument);

module.exports = router;


