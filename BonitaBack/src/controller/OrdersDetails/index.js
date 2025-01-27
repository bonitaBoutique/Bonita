const { getOrdersDetails } = require("./getOrdersDetails");
const { createOrderDetail } = require("./createOrderDetail");
const {getOrderDetailID} =  require("./getOrderDetailID");
const {getOrderByOrderId} =  require("./getOrderByOrderId");
const {createOrderWithReservation} = require("./createOrderWithReservation");
const {updateReservation} = require("../ReservationController/updateReservation");



module.exports = {
  getOrdersDetails,
  createOrderDetail,
  getOrderDetailID,
  getOrderByOrderId,
  createOrderWithReservation,
updateReservation
}