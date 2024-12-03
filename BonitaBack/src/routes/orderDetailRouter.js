const  Router  = require('express');
const controller = require('../controller')

const router = Router();

router.post('/create', controller.createOrderDetail);
router.get('/', controller.getOrdersDetails)
router.get('/products/:id_orderDetail',controller.getOrderByOrderId);
router.get('/:n_document',controller.getOrderDetailID);
router.put('/:id_orderDetail', controller.updateOrderDetail);
module.exports = router;