const  Router  = require('express');
const { getClientAccountBalance } = require('../controller/AccountBalance/getClientAccountBalance')

const router = Router();

router.post('/n:document', getClientAccountBalance);

 


module.exports = router;