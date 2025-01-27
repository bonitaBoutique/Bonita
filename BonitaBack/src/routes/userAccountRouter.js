const  Router  = require('express');
const { getClientAccountBalance } = require('../controller/AccountBalance/getClientAccountBalance')
const {getAllClientAccounts} = require('../controller/AccountBalance/getAllClientAccounts')


const router = Router();

router.get('/:n_document', getClientAccountBalance);
router.get('/', getAllClientAccounts);
 


module.exports = router;