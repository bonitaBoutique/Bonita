const  Router  = require('express');
const controller = require('../controller');

const router = Router();

router.post('/createReceipt', controller.createReceipt);
router.post('/redeem/:n_document', controller.redeemGiftCard);
router.get('/lastReceipt', controller.lastReceipt);
router.get('/receipts', controller.getReceipts)

// Nueva ruta específica para GiftCard
router.get('/receipts/giftcard', controller.getGiftCardReceipts);
router.get('/active-giftcards', controller.getActiveGiftCards);

// ✅ Obtener pagos de Addi y Sistecredito
router.get("/addi-sistecredito", controller.getAddiSistecreditoPayments);

// ✅ Actualizar información de depósito
router.put("/deposit/:receiptId", controller.updatePaymentAddiSistecredito);  // ✅ Función correcta

module.exports = router;