const SellerData = require("../data/models/SellerData");
const { catchedAsync } = require("../utils");
const {
  updateSellerData,
  getOrCreateSellerData,
  getSellerDataBySdocno
} = require("./Taxxa/sellerDataControllers");
const { getProductStock, createProduct, getStock,  returnProducts,
    getReceiptForReturn,
    getReturnHistory } = require("./Products");

// ✅ IMPORTAR CONTROLADORES DE DEVOLUCIONES
const { getReturns, getReturnById, getReturnStats } = require("./Products/getReturns");

    const { 
  getServerTime, 
  getDateRange, 
  getSystemInfo,
  updateCompletedReservations
} = require("./systemController");

const {
  createReceipt, 
  lastReceipt, 
  getReceipts, 
  getActiveGiftCards, 
  getGiftCardReceipts, 
  redeemGiftCard, 
  createGiftCard, 
  getGiftCardBalance
} = require("./Caja");

// ✅ AGREGAR IMPORTS DE ADDI/SISTECREDITO DESDE CONTROLLERS/
const createAddiSistecreditoDeposit = require("./createAddiSistecreditoDeposit");
const getAddiSistecreditoConciliation = require("./getAddiSistecreditoConciliation");
const getAddiSistecreditoDeposits = require("./getAddiSistecreditoDeposits");
const updateAddiSistecreditoDeposit = require("./updateAddiSistecreditoDeposit");
const markReceiptAsConciliated = require("./markReceiptAsConciliated");

const { createExpense, filterExpenses } = require("./Informes");
const getSendingById = require("./MiPaquete/getSendingById");
const generateApiKey = require("./MiPaquete/generateApiKey");
const getSendingTracking = require("./MiPaquete/getSendingTracking");
const cancelSending = require("./MiPaquete/cancelSending");
const {
  createDirection,
  updateDirection,
  deleteDirection,
} = require("./MiPaquete/createDirection");
const createOrderWithReservation = require("./OrdersDetails/createOrderWithReservation");
const removedProduct = require("./OrdersDetails/removedProduct");

const getBalance = require("./Informes/getBalance");
const { forgotPassword } = require("./nodemailerController/forgotPassword.js");
const { resetPassword } = require("./nodemailerController/resetPassword.js");
const { sendEmail } = require("./nodemailerController/index.js");
const { getClientAccountBalance, getAllClientAccounts, resumenDeCuenta } = require("./AccountBalance/index.js");
const { getAllReservations, updateReservation, reservationByDocument, applyingPayments } = require("./ReservationController");
const { createInvoice } = require("./Taxxa/TaxxaService");
const { postInvoice, getAllInvoices } = require("./invoiceControllers.js");
const { getInvoiceByStatus } = require("./invoiceControllers.js");
const { getLastInvoiceNumber } = require("./invoiceControllers.js");

// ✅ IMPORTAR CONTROLADORES DE PROMOCIONES
const { 
  getActivePromotion, 
  getAllPromotions, 
  createPromotion, 
  updatePromotion, 
  togglePromotion, 
  deletePromotion 
} = require("./Promotions/promotionController");

module.exports = {
  createProduct: catchedAsync(require("./Products/createProduct")),
  getStock: catchedAsync(require("./Products/getStock")),
  createCategory: catchedAsync(require("./Category/createCategory")),
  createSB: catchedAsync(require("./SubCategory/createSB")),
  putProduct: catchedAsync(require("./Products/putProduct")),
  deleteProduct: catchedAsync(require("./Products/deleteProduct")),
  getAllProduct: catchedAsync(require("./Products/getAllProduct")),
  getProductId: catchedAsync(require("./Products/getProductId")),
  putUser: catchedAsync(require("./Users/putUser")),
  deleteUser: catchedAsync(require("./Users/deleteUser")),
  getCategory: catchedAsync(require("./Category/getCategory")),
  getSB: catchedAsync(require("./SubCategory/getSB")),
  createOrderDetail: catchedAsync(require("./OrdersDetails/createOrderDetail")),
  getOrdersDetails: catchedAsync(require("./OrdersDetails/getOrdersDetails")),
  removedProduct: catchedAsync(removedProduct),
  createOrderWithReservation: catchedAsync(createOrderWithReservation),
  createUsers: catchedAsync(require("./Users/createUsers")),
  getOrderDetailID: catchedAsync(require("./OrdersDetails/getOrderDetailID")),
  getOrderByOrderId: catchedAsync(require("./OrdersDetails/getOrderByOrderId")),
  updateOrderDetail: catchedAsync(require("./OrdersDetails/updateOrderDetail")),
  deleteOrderDetail: catchedAsync(require("./OrdersDetails/deleteOrderDetail")),
  webhook: catchedAsync(require("./webhook")),
  initWompiPayment: catchedAsync(require("./Payments/initWompiPayment")),
  wompiWebhook: catchedAsync(require("./Payments/wompiWebhook")),
  listPaymentIntents: catchedAsync(require("./Payments/listPaymentIntents")),
  getOrCreateSellerData: catchedAsync(getOrCreateSellerData),
  getSellerDataBySdocno: catchedAsync(getSellerDataBySdocno),
  updateSellerData: catchedAsync(updateSellerData),
  TaxxaService: catchedAsync(require("./Taxxa/TaxxaService")),
  taxxaUtils: catchedAsync(require("./Taxxa/taxxaUtils")),
  getProductStock: catchedAsync(require("./Products/getProductStock")),
  createReceipt: catchedAsync(createReceipt),
  lastReceipt: catchedAsync(lastReceipt),
  getReceipts: catchedAsync(getReceipts),
  createExpense: catchedAsync(createExpense),
  filterExpenses: catchedAsync(filterExpenses),
  deleteExpense: catchedAsync(require("./Informes/deleteExpense")),
  getLocations: catchedAsync(require("./MiPaquete/getLocations")),
  quoteShipping: catchedAsync(require("./MiPaquete/quoteShipping")),
  createSending: catchedAsync(require("./MiPaquete/createSending")),
  getSending: catchedAsync(require("./MiPaquete/getSending")),
  getSendingById: catchedAsync(getSendingById),
  generateApiKey: catchedAsync(generateApiKey),
  getSendingTracking: catchedAsync(getSendingTracking),
  cancelSending: catchedAsync(cancelSending),
  createDirection: catchedAsync(createDirection),
  updateDirection: catchedAsync(updateDirection),
  deleteDirection: catchedAsync(deleteDirection),
  updateReservation: catchedAsync(updateReservation),
  getBalance: catchedAsync(getBalance),
  resumenDeCuenta: catchedAsync(resumenDeCuenta),
  forgotPassword: catchedAsync(forgotPassword),
  resetPassword: catchedAsync(resetPassword),
  sendEmail: catchedAsync(sendEmail),
  getClientAccountBalance: catchedAsync(getClientAccountBalance),
  getAllClientAccounts: catchedAsync(getAllClientAccounts),
  getAllReservations: catchedAsync(getAllReservations),
  reservationByDocument: catchedAsync(reservationByDocument),
  applyingPayments: catchedAsync(applyingPayments),
  createInvoice: catchedAsync(createInvoice),
  postInvoice: catchedAsync(postInvoice),
  getAllInvoices: catchedAsync(getAllInvoices),
  getInvoiceByStatus: catchedAsync(getInvoiceByStatus),
  getLastInvoiceNumber: catchedAsync(getLastInvoiceNumber),
  getGiftCardReceipts: catchedAsync(getGiftCardReceipts),
  getActiveGiftCards: catchedAsync(getActiveGiftCards),
  redeemGiftCard: catchedAsync(redeemGiftCard),
  createGiftCard: catchedAsync(createGiftCard),
  getGiftCardBalance: catchedAsync(getGiftCardBalance),
  
  // ✅ NUEVAS FUNCIONES PARA ADDI/SISTECREDITO
  createAddiSistecreditoDeposit: catchedAsync(createAddiSistecreditoDeposit),
  getAddiSistecreditoConciliation: catchedAsync(getAddiSistecreditoConciliation),
  getAddiSistecreditoDeposits: catchedAsync(getAddiSistecreditoDeposits),
  updateAddiSistecreditoDeposit: catchedAsync(updateAddiSistecreditoDeposit),
  markReceiptAsConciliated: catchedAsync(markReceiptAsConciliated),

  returnProducts: catchedAsync(require("./Products/returnProducts")),
  getReceiptForReturn: catchedAsync(require("./Products/getReceiptForReturn")),
  getReturnHistory: catchedAsync(require("./Products/getReturnHistory")),
  getReturns: catchedAsync(getReturns),
  getReturnById: catchedAsync(getReturnById),
  getReturnStats: catchedAsync(getReturnStats),
  
  getServerTime: catchedAsync(getServerTime),
  getDateRange: catchedAsync(getDateRange),
  getSystemInfo: catchedAsync(getSystemInfo),
  updateCompletedReservations: catchedAsync(updateCompletedReservations),

  // ✅ CONTROLADORES DE PROMOCIONES
  getActivePromotion: catchedAsync(getActivePromotion),
  getAllPromotions: catchedAsync(getAllPromotions),
  createPromotion: catchedAsync(createPromotion),
  updatePromotion: catchedAsync(updatePromotion),
  togglePromotion: catchedAsync(togglePromotion),
  deletePromotion: catchedAsync(deletePromotion),
};