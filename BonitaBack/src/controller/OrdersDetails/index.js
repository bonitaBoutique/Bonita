const { getOrdersDetails } = require("./getOrdersDetails");
const { createOrderDetail } = require("./createOrderDetail");
const {getOrderDetailID} =  require("./getOrderDetailID");
const {getOrderByOrderId} =  require("./getOrderByOrderId");
const {createOrderWithReservation} = require("./createOrderWithReservation");
const {updateReservation} = require("../ReservationController/updateReservation");
const {deleteOrderDetail} = require("./deleteOrderDetail");
const {removedProduct} = require("./removedProduct");

module.exports = {
  getOrdersDetails,
  createOrderDetail,
  getOrderDetailID,
  getOrderByOrderId,
  createOrderWithReservation,
updateReservation,
  deleteOrderDetail,
  removedProduct
  // Otros controladores que necesites importar
}