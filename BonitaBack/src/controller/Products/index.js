const createProduct = require("./createProduct");
const putProduct = require("./putProduct");
const deleteProduct = require("./deleteProduct");
const getAllProduct = require("./getAllProduct");
const getProductId = require("./getProductId");
const getStock = require("./getStock");
const returnProducts= require("./returnProducts")
const getProductStock = require("./getProductStock")
const getReceiptForReturn = require("./getReceiptForReturn");
const getReturnHistory = require("./getReturnHistory");
const { getReturns, getReturnById, getReturnStats } = require("./getReturns");

module.exports={
    createProduct,
    deleteProduct,
    putProduct,
    getAllProduct,
    getProductId,
    getProductStock,
    getStock,
    returnProducts,
    getReceiptForReturn,
    getReturnHistory,
    getReturns,
    getReturnById,
    getReturnStats
    
}