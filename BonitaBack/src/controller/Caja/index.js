const createReceipt = require("./createReceipt");
const getGiftCardReceipts = require("./getGiftCardReceipts");
const getReceipts = require("./getReceipts");
const lastReceipt = require("./lastReceipt");
const getActiveGiftCards = require("./getActiveGiftCards");
const redeemGiftCard = require("./redeemGiftCard");
const getAddiSistecreditoPayments = require("./getAddiSistecreditoPayments");
const updatePaymentAddiSistecredito = require("./updatePaymentAddiSistecredito");
const { createGiftCard, getGiftCardBalance } = require("./createGiftCard");

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