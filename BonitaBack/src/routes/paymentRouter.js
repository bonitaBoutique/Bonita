const Router = require("express");
const controller = require("../controller");

const router = Router.Router();

router.post("/wompi/init", controller.initWompiPayment);
router.post("/wompi/webhook", controller.wompiWebhook);
router.get("/wompi", controller.listPaymentIntents);

module.exports = router;
