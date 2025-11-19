const { Router } = require("express");
const {
  createAddiSistecreditoDeposit,
  getAddiSistecreditoConciliation,
  getAddiSistecreditoDeposits,
  updateAddiSistecreditoDeposit,
  markReceiptAsConciliated
} = require("../controller");

const router = Router();

// ✅ REGISTRAR UN NUEVO DEPÓSITO
router.post("/deposit", createAddiSistecreditoDeposit);

// ✅ OBTENER LISTA DE DEPÓSITOS CON FILTROS
router.get("/deposits", getAddiSistecreditoDeposits);

// ✅ OBTENER CONCILIACIÓN (DEPÓSITOS VS RECIBOS)
router.get("/conciliation", getAddiSistecreditoConciliation);

// ✅ ACTUALIZAR UN DEPÓSITO (ESTADO, NOTAS, ETC.)
router.put("/deposit/:depositId", updateAddiSistecreditoDeposit);

// ✅ MARCAR RECIBO COMO CONCILIADO
router.put("/receipt/:receiptId/conciliate", markReceiptAsConciliated);

module.exports = router;