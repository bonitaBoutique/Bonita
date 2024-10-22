import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchOrdersByDocument } from '../Redux/Actions/actions';

const OrdersDetails = () => {
 const dispatch = useDispatch();
 const { n_document } = useParams();
 const orderDetails = useSelector((state) => state.orders); 
 const { loading, error, orders } = orderDetails;

useEffect(() => {
 console.log('Fetching orders for n_document:', n_document);
 dispatch(fetchOrdersByDocument(n_document));
 }, [dispatch, n_document]);

useEffect(() => {
 console.log('Orders state:', orderDetails);
 }, [orderDetails]);

return (
 <div className="max-w-4xl mx-auto px-4 py-8">
 {loading ? (
 <p className="text-center text-gray-600">Loading... </p>
 ) : error ? (
 <p className="text-center text-red-600">{error}</p>
 ) : (
 <div>
 {orders.map((order, index) => (
 <div key={order.id_orderDetail} className={`bg-white shadow-md rounded-lg mb-4 ${index !== 0 ? 'mt-8' : ''}`}>
 <div className="p-4">
 <p className="text-lg font-semibold">Pedido N°: {order.id_orderDetail}</p>
 <p className="text-gray-600">Fecha: {order.date}</p>
 <p className="mt-2">Total: ${order.amount}</p>
 <p>Cantidad: {order.quantity}</p>
 <p>Estado de pediddo: {order.state_order}</p>
 <p>N° de envío:{order.trackingNumber}</p>
 
 
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
};

export default OrdersDetails;