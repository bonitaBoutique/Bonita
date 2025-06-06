const createReceipt = require("./createReceipt");
const getGiftCardReceipts = require("./getGiftCardReceipts");
const getReceipts = require("./getReceipts");
const lastReceipt = require("./lastReceipt");
const getActiveGiftCards = require("./getActiveGiftCards");
const redeemGiftCard = require("./redeemGiftCard");

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
  
};