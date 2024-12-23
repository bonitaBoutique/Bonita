const SellerData = require("../data/models/SellerData");
const {catchedAsync} = require("../utils");
const webhook = require("./webhook");
const {  updateSellerData, getOrCreateSellerData } = require("./Taxxa/sellerDataControllers");
const { getProductStock } = require("./Products");
const { createReceipt, lastReceipt, getReceipts } = require("./Caja");




module.exports = {
    createProduct:catchedAsync(require("./Products/createProduct")),
    createCategory:catchedAsync(require("./Category/createCategory")),
    createSB:catchedAsync(require("./SubCategory/createSB")),
    putProduct:catchedAsync(require("./Products/putProduct")),
    deleteProduct:catchedAsync(require("./Products/deleteProduct")),
    getAllProduct:catchedAsync(require("./Products/getAllProduct")),
    getProductId:catchedAsync(require("./Products/getProductId")),
    putUser:catchedAsync(require("./Users/putUser")),
    deleteUser:catchedAsync(require("./Users/deleteUser")),
    getCategory:catchedAsync(require("./Category/getCategory")),
    getSB:catchedAsync(require("./SubCategory/getSB")),
    createOrderDetail:catchedAsync(require("./OrdersDetails/createOrderDetail")),
    getOrdersDetails:catchedAsync(require("./OrdersDetails/getOrdersDetails")),
    createUsers:catchedAsync(require("./Users/createUsers")),
    getOrderDetailID:catchedAsync(require("./OrdersDetails/getOrderDetailID")),
    getOrderByOrderId:catchedAsync(require("./OrdersDetails/getOrderByOrderId")),
    updateOrderDetail:catchedAsync(require("./OrdersDetails/updateOrderDetail")),
    webhook:catchedAsync(require("./webhook")),
    getOrCreateSellerData: catchedAsync(getOrCreateSellerData),  // Aquí importa directamente el controlador
    updateSellerData: catchedAsync(updateSellerData),
    TaxxaService: catchedAsync(require("./Taxxa/TaxxaService")),
    getProductStock: catchedAsync(require("./Products/getProductStock")),
    createReceipt: catchedAsync(require("./Caja/createReceipt")),
    lastReceipt: catchedAsync(require("./Caja/lastReceipt")),
    getReceipts: catchedAsync(require('./Caja/getReceipts'))
}