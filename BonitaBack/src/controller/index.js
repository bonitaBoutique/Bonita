const SellerData = require("../data/models/SellerData");
const {catchedAsync} = require("../utils");
const webhook = require("./webhook");
const { createSellerData, updateSellerData, getSellerData } = require("./Taxxa/sellerDataControllers");



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
    updateOrderDetail:catchedAsync(require("./OrdersDetails/updateOrderDetail")),
    webhook:catchedAsync(require("./webhook")),
    createSellerData: catchedAsync(createSellerData),  // Aquí importa directamente el controlador
    updateSellerData: catchedAsync(updateSellerData),
    getSellerData: catchedAsync(getSellerData)
}