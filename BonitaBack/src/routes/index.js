const { Router } = require('express');

const router = Router();

router.use("/product", require("./productRouter"));
router.use("/category", require("./categoryRouter"));
router.use("/sb", require("./sbRouter"));
router.use("/order", require('./orderDetailRouter'))
router.use("/user", require("./userRouter"))
router.use("/auth", require("./authRouter"))
router.use('/seller', require("./sellerDataRouter"))
router.use('/caja', require('./cajaRouter') )
router.use('/expense', require('./expenseRouter') )
router.use('/envio', require('./miPaqueteWebhook') )
router.use('/mipaquete', require('./MiPaqueteRouter') )
router.use('/balance', require('./balanceRouter') )
router.use('/correo', require('./nodemailerRouter') )
router.use('/userAccount', require('./userAccountRouter') )
router.use('/reservation', require('./reservationRouter') )
router.use('/invoice', require('./invoiceRouter') )
router.use('/taxxa', require('./taxxaRouter') )
router.use('/giftcard', require('./giftCardRouter') )
router.use('/creditPayment', require('./addiSistecreditoRoutes') )
router.use("/addi-sistecredito", require("./addiSistecreditoRoutes"));
router.use('/system', require('./systemRouter'));    
router.use('/payments', require('./paymentRouter'));


module.exports = router;