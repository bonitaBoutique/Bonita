const  Router  = require('express');
const controller = require('../controller');

const router = Router();

router.post('/createReceipt', controller.createReceipt);

router.get('/lastReceipt', controller.lastReceipt);
router.get('/receipts', controller.getReceipts)



module.exports = router;