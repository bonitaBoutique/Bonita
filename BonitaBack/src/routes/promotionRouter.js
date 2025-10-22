/**
 * Rutas: Promotions
 * Descripción: Endpoints para gestión de promociones
 * Autor: Sistema de Promociones
 */

const express = require("express");
const router = express.Router();
const {
  getActivePromotion,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  togglePromotion,
  deletePromotion,
} = require("../controller/Promotions/promotionController");

// ✅ RUTAS PÚBLICAS (sin autenticación)
// Cualquier persona puede ver la promoción activa
router.get("/active", getActivePromotion);

// ✅ RUTAS PROTEGIDAS (requieren autenticación)
// Solo usuarios autenticados pueden gestionar promociones

// Obtener todas las promociones (historial)
router.get("/", getAllPromotions);

// Crear una nueva promoción
router.post("/", createPromotion);

// Actualizar una promoción existente
router.put("/:id", updatePromotion);

// Activar/Desactivar una promoción
router.patch("/:id/toggle", togglePromotion);

// Eliminar una promoción
router.delete("/:id", deletePromotion);

module.exports = router;
