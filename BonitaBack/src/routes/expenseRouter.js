const  Router  = require('express');
const controller = require('../controller');

const router = Router();

router.post('/create', controller.createExpense);
router.get('/filter', controller.filterExpenses);
router.delete('/delete/:id', controller.deleteExpense);


module.exports = router;