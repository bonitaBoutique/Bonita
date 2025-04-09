const express = require('express');
const router = express.Router();
const controller = require('../controller/invoiceControllers');
//const taxxaController = require('../controller/Taxxa/TaxxaService');

// Ruta para obtener todas las facturas
router.get('/all', controller.getAllInvoices);

// Ruta para obtener el último número de factura
router.get('/lastNumber', controller.getLastInvoiceNumber);

// Rutas dinámicas al final
router.get('/:status', controller.getInvoicesByStatus);
//router.post('/', controller.postInvoice);

module.exports = router;