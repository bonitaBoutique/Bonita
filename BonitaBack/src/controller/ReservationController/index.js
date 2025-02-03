
const applyingPayments = require("./applyingPayments");
const getAllReservations  = require("./getAllReservations");
const  reservationByDocument  = require("./reservationByDocument");
const  updateReservation  = require("./updateReservation");


module.exports = {
  getAllReservations,
  reservationByDocument,
  updateReservation,
  applyingPayments
  
};

