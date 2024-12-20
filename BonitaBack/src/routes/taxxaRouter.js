const  Router  = require('express');
const controller = require('../controller');
const { sendToLibrary, createInvoice } = require('../controller/Taxxa/TaxxaService')

const router = Router();



router.post('/', controller.getOrCreateSellerData);
router.post('/doc', sendToLibrary);
router.post('/invoice', createInvoice);



module.exports = router;