const express = require('express');
const { 
  getServerTime, 
  getDateRange,
  getSystemInfo,
  updateCompletedReservations
} = require('../controller'); // ✅ CAMBIAR: Importar desde el index de controllers

const router = express.Router();

// ✅ Ruta para obtener fecha/hora del servidor (Colombia)
router.get('/server-time', getServerTime);

// ✅ Ruta para obtener rango de fechas calculado en servidor
router.get('/date-range', getDateRange);

// ✅ Ruta para información general del sistema
router.get('/info', getSystemInfo);

// ✅ Ruta para actualizar reservas con saldo 0 a Completada
router.post('/update-completed-reservations', updateCompletedReservations);

module.exports = router;