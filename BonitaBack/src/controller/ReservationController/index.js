const {applyingPayments} = require("./applyingPayments");
const { getAllReservations } = require("./GetAllReservations");
const { reservationByDocument } = require("./reservationByDocument");
const { updateReservation } = require("./updateReservation");

module.exports = {
  getAllReservations,
  reservationByDocument,
  updateReservation,
  applyingPayments
  
};
