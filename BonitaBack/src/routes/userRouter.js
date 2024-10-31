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
router.get("/", authenticate, authorize(['Admin']), getAllUsers);

// Ruta para obtener un usuario por documento
router.get("/:n_document", getUserByDocument);

module.exports = router;


