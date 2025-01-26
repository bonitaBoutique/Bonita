const  Router  = require('express');
const controller = require('../controller')

const router = Router();

router.get('/all', controller.getAllReservations);
router.put('/update/:id_reservation', controller.updateReservation);
 router.get('/document/:n_document', controller.reservationByDocument);


module.exports = router;