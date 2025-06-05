const Router = require('express');
const controller = require('../controller');

// ✅ Debug: Verificar que los controladores están disponibles
console.log("🔍 Controller disponible:");
console.log("getAddiSistecreditoPayments:", typeof controller.getAddiSistecreditoPayments);
console.log("updatePaymentAddiSistecredito:", typeof controller.updatePaymentAddiSistecredito);

const router = Router();

router.post('/createReceipt', controller.createReceipt);
router.post('/redeem/:n_document', controller.redeemGiftCard);
router.get('/lastReceipt', controller.lastReceipt);
router.get('/receipts', controller.getReceipts);

router.get('/receipts/giftcard', controller.getGiftCardReceipts);
router.get('/active-giftcards', controller.getActiveGiftCards);

// ✅ Agregar validación antes de usar
if (typeof controller.getAddiSistecreditoPayments === 'function') {
    router.get("/addi-sistecredito", controller.getAddiSistecreditoPayments);
} else {
    console.error("❌ getAddiSistecreditoPayments no es una función");
}

if (typeof controller.updatePaymentAddiSistecredito === 'function') {
    router.put("/deposit/:receiptId", controller.updatePaymentAddiSistecredito);
} else {
    console.error("❌ updatePaymentAddiSistecredito no es una función");
}

module.exports = router;