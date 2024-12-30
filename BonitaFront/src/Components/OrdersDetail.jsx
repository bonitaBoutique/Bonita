import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchOrdersByDocument } from '../Redux/Actions/actions';
import Navbar2 from './Navbar2';
import backgroundImage from '../assets/img/BannerPrincipal/banner3.png';

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
    <div className="relative min-h-screen bg-gray-800">
      <Navbar2 />
      {/* Imagen de fondo */}
      <img
        src={backgroundImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white">
        {loading ? (
          <p className="text-center text-gray-200 text-2xl">Cargando...</p>
        ) : error ? (
          <p className="text-center text-red-500 text-2xl">{error}</p>
        ) : orders.length === 0 ? (
          <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-800 text-2xl font-semibold">No tienes pedidos aún.</p>
            <p className="text-gray-600 mt-2">Explora nuestra tienda y realiza tu primer pedido.</p>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
            {orders.map((order, index) => (
              <div
                key={order.id_orderDetail}
                className="bg-white bg-opacity-90 shadow-xl rounded-xl p-6"
              >
                <p className="text-xl font-semibold text-gray-800">
                  Pedido N°: {order.id_orderDetail}
                </p>
                <p className="text-gray-600 mt-1">Fecha: {order.date}</p>
                <p className="mt-4 text-gray-800 font-semibold">Total: ${order.amount}</p>
                <p className="text-gray-600">Cantidad: {order.quantity}</p>
                <p className={`mt-2 font-semibold ${
                  order.state_order === 'Enviado'
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}>
                  Estado de pedido: {order.state_order}
                </p>
                <p className="text-gray-600 mt-1">N° de envío: {order.trackingNumber || 'No disponible'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersDetails;
