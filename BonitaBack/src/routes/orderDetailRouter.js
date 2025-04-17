const  Router  = require('express');
const controller = require('../controller')

const router = Router();

// --- Rutas POST ---
router.post('/create', controller.createOrderDetail);
router.post("/reservations/:id_orderDetail", controller.createOrderWithReservation);

// --- Rutas GET ---
router.get('/', controller.getOrdersDetails);
router.get('/products/:id_orderDetail',controller.getOrderByOrderId);
router.get("/reservations", controller.getAllReservations); // Más específica antes
router.get('/:n_document',controller.getOrderDetailID); // Más general después

// --- Rutas PUT ---
router.put('/reservations/:id_reservation', controller.updateReservation); // Más específica antes
router.put('/:id_orderDetail', controller.updateOrderDetail); // Más general después

// --- Ruta DELETE ---
router.delete('/:id', controller.deleteOrderDetail);



module.exports = router;