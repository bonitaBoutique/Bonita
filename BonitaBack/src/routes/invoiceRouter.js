const express = require('express');
const router = express.Router();
const controller = require('../controller/invoiceControllers');

// Specific routes first
router.get('/lastNumber', controller.getLastInvoiceNumber);

// Dynamic routes last
router.get('/:status', controller.getInvoicesByStatus);
router.post('/', controller.postInvoice);

module.exports = router;