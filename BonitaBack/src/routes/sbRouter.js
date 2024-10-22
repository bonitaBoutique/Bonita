const  Router  = require('express');
const controller = require('../controller');

const router = Router();

router.post('/createSB', controller.createSB);

router.get('/', controller.getSB);


module.exports = router;