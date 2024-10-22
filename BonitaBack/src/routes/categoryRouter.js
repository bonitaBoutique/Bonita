const  Router  = require('express');
const controller = require('../controller');

const router = Router();

router.post('/createCategory', controller.createCategory);

router.get('/', controller.getCategory);


module.exports = router;