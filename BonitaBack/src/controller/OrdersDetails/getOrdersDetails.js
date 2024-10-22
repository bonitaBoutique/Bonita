// controllers/getAllorders.js
const { OrderDetail, Product } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
 try {
 const { latest } = req.query;
 const orders = await OrderDetail.findAll({
 include: {
 model: Product,
 as: 'products',
 attributes: ['id_product'], // Selecciona el id_product de los productos
 },
 order: [['createdAt', 'DESC']]
 });

if (latest === 'true') {
 // Si se pide la última orden, devolver solo la más reciente con todos los detalles
 if (orders.length === 0) {
 return response(res, 404, { error: "No se encontraron órdenes." });
 }
 const latestOrder = orders[0];
 const formattedOrder = {
 id_orderDetail: latestOrder.id_orderDetail,
 date: latestOrder.date,
 amount: latestOrder.amount,
 quantity: latestOrder.quantity,
 state_order: latestOrder.state_order,
 address: latestOrder.address,
 deliveryAddress: latestOrder.deliveryAddress,
 n_document: latestOrder.n_document,
 products: latestOrder.products.map(product => ({
 id_product: product.id_product,
 integritySignature: latestOrder.integritySignature,
 trackingNumber: latestOrder.trackingNumber,
 })),
 };
 return response(res, 200, { orderDetail: formattedOrder });
 }

const formattedOrders = orders.map(order => ({
 id_orderDetail: order.id_orderDetail,
 date: order.date,
 amount: order.amount,
 quantity: order.quantity,
 state_order: order.state_order,
 product_ids: order.products.map(product => product.id_product), // Mapea solo los id_product
 trackingNumber: order.trackingNumber, 
}));

return response(res, 200, { orders: formattedOrders });
 } catch (error) {
 console.error('Error fetching orders:', error);
 return response(res, 500, { error: error.message });
 }
};