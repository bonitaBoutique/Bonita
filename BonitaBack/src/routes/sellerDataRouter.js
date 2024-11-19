const  Router  = require('express');
const controller = require('../controller');

const router = Router();



router.post('/create', controller.createSellerData);
router.put('/:id', controller.updateSellerData);
router.get('/', controller.getSellerData)






module.exports = router;
