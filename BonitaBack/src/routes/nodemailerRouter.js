const  Router  = require('express');
const { forgotPassword } = require('../controller/nodemailerController/forgotPassword');
const { resetPassword } = require('../controller/nodemailerController/resetPassword');


const router = Router();




router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword/:token', resetPassword);


module.exports = router;