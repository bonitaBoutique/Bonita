const  Router  = require('express');
const controller = require('../controller');

const router = Router();



router.post('/', controller.getOrCreateSellerData);
router.put('/:id', controller.updateSellerData);







module.exports = router;
