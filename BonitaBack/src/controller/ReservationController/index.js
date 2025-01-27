const { getAllReservations } = require("./getAllReservations");
const {applyingPayments} = require("./applyingPayments");
const { reservationByDocument } = require("./reservationByDocument");
const { updateReservation } = require("./updateReservation");

module.exports = {
  getAllReservations,
  reservationByDocument,
  updateReservation,
  applyingPayments
  
};

