const  Router  = require('express');
const { getClientAccountBalance } = require('../controller/AccountBalance/getClientAccountBalance')
const {getAllClientAccounts} = require('../controller/AccountBalance/getAllClientAccounts')
const resumenDeCuenta= require('../controller/AccountBalance/resumenDeCuenta')

const router = Router();
router.get('/resumenDeCuenta/:n_document', resumenDeCuenta)
router.get('/:n_document', getClientAccountBalance);
router.get('/', getAllClientAccounts);

 


module.exports = router;