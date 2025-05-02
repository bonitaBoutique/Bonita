const express = require('express');
const router = express.Router();
const controller = require('../controller/invoiceControllers');
//const taxxaController = require('../controller/Taxxa/TaxxaService');

// Rutas específicas primero
router.get('/lastNumber', controller.getLastInvoiceNumber);
router.get('/allInvoices', controller.getAllInvoices);
// Rutas dinámicas al final
router.get('/:status', controller.getInvoicesByStatus);
//router.post('/', taxxaController.createInvoice); // Cambia a createInvoice si es necesario

module.exports = router;