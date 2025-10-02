const Router = require('express');
const controller = require('../controller');

const router = Router();

// ✅ RUTAS ESPECÍFICAS PRIMERO
router.get('/search', controller.getAllProduct);
router.get('/', controller.getAllProduct);

// ✅ AMBAS RUTAS DE STOCK - CADA UNA CON SU PROPÓSITO
router.get("/stock/:id_product", controller.getProductStock); // Para obtener stock de UN producto
router.get("/stock-movements", controller.getStock); // Para listar TODOS los movimientos

// ✅ NUEVAS RUTAS DE DEVOLUCIONES
router.get("/receipt-for-return/:receipt_id", controller.getReceiptForReturn); // Buscar recibo para devolución
router.post("/process-return", controller.returnProducts); // Procesar devolución
router.get("/returns-history", controller.getReturnHistory); // Historial de devoluciones
router.get("/returns", controller.getReturns); // Obtener todas las devoluciones
router.get("/returns/stats", controller.getReturnStats); // Estadísticas de devoluciones
router.get("/returns/:id", controller.getReturnById); // Obtener devolución específica

// ✅ RUTAS CON PARÁMETROS AL FINAL
router.get('/:id_product', controller.getProductId);

// ✅ RUTAS DE CRUD
router.post('/createProducts', controller.createProduct);
router.put('/updateProducts/:id', controller.putProduct);
router.delete('/deleteProducts/:id', controller.deleteProduct);

module.exports = router;

