const { getOrdersDetails } = require("./getOrdersDetails");
const { createOrderDetail } = require("./createOrderDetail");
const {getOrderDetailID} =  require("./getOrderDetailID");
const {getOrderByOrderId} =  require("./getOrderByOrderId");

module.exports = {
  getOrdersDetails,
  createOrderDetail,
  getOrderDetailID,
  getOrderByOrderId
}