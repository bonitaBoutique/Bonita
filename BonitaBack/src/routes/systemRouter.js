const express = require('express');
const { 
  getServerTime, 
  getDateRange,
  getSystemInfo 
} = require('../controller'); // ✅ CAMBIAR: Importar desde el index de controllers

const router = express.Router();

// ✅ Ruta para obtener fecha/hora del servidor (Colombia)
router.get('/server-time', getServerTime);

// ✅ Ruta para obtener rango de fechas calculado en servidor
router.get('/date-range', getDateRange);

// ✅ Ruta para información general del sistema
router.get('/info', getSystemInfo);

module.exports = router;