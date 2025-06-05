const createReceipt = require("./createReceipt");
const getGiftCardReceipts = require("./getGiftCardReceipts");
const getReceipts = require("./getReceipts");
const lastReceipt = require("./lastReceipt");
const getActiveGiftCards = require("./getActiveGiftCards");
const redeemGiftCard = require("./redeemGiftCard");
const getAddiSistecreditoPayments = require("./getAddiSistecreditoPayments");
const updatePaymentAddiSistecredito = require("./updatePaymentAddiSistecredito");
const { createGiftCard, getGiftCardBalance } = require("./createGiftCard");

// ✅ Debug: Verificar que las funciones se importan correctamente
console.log("🔍 Verificando imports:");
console.log("getAddiSistecreditoPayments:", typeof getAddiSistecreditoPayments);
console.log("updatePaymentAddiSistecredito:", typeof updatePaymentAddiSistecredito);

module.exports = {
    createReceipt,
    lastReceipt,
    getReceipts,
    getActiveGiftCards,
    getGiftCardReceipts,
    redeemGiftCard,
    createGiftCard,
    getGiftCardBalance,
    getAddiSistecreditoPayments,
    updatePaymentAddiSistecredito
};