const { Router } = require('express');

const router = Router();

router.use("/product", require("./productRouter"));
router.use("/category", require("./categoryRouter"));
router.use("/sb", require("./sbRouter"));
router.use("/order", require('./orderDetailRouter'))
router.use("/user", require("./userRouter"))
router.use("/auth", require("./authRouter"))
router.use("/eventos", require("./webhookRouter"))
router.use('/seller', require("./sellerDataRouter"))
router.use('/taxxa', require("./taxxaRouter"))
router.use('/caja', require('./cajaRouter') )




module.exports = router;