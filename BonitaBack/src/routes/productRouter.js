const  Router  = require('express');
const controller = require('../controller');

const router = Router();

router.get('/search', controller.getAllProduct);

router.get('/', controller.getAllProduct);
 
router.get('/:id', controller.getProductId);

router.post('/createProducts', controller.createProduct);

router.delete('/deleteProducts/:id', controller.deleteProduct);

router.put('/updateProducts/:id', controller.putProduct);






module.exports = router;

