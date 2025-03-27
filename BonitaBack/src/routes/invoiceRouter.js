const express = require('express');
const router = express.Router();
const controller  = require('../controller/invoiceControllers');


router.post('/', controller.postInvoice);
router.get('/:status', controller.getInvoicesByStatus);
router.get('/lastNumber', controller.getLastInvoiceNumber);

module.exports = router;