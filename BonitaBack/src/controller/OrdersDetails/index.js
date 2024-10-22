const { getOrdersDetails } = require("./getOrdersDetails");
const { createOrderDetail } = require("./createOrderDetail");
const {getOrderDetailID} =  require("./getOrderDetailID");

module.exports = {
  getOrdersDetails,
  createOrderDetail,
  getOrderDetailID 
}