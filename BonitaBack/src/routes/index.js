const { Router } = require('express');

const router = Router();

router.use("/product", require("./productRouter"));
router.use("/category", require("./categoryRouter"));
router.use("/sb", require("./sbRouter"));
router.use("/order", require('./orderDetailRouter'))
router.use("/user", require("./userRouter"))
router.use("/auth", require("./authRouter"))
router.use("/eventos", require("./webhookRouter"))


module.exports = router;