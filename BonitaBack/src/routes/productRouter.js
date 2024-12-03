const  Router  = require('express');
const controller = require('../controller');

const router = Router();

router.get('/search', controller.getAllProduct);

router.get('/', controller.getAllProduct);
 
router.get('/:id_product', controller.getProductId);

router.post('/createProducts', controller.createProduct);

router.delete('/deleteProducts/:id', controller.deleteProduct);

router.put('/updateProducts/:id', controller.putProduct);
router.get("/stock/:id_product", controller.getProductStock);





module.exports = router;

