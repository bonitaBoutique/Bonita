import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderState } from '../Redux/Actions/actions';
import Swal from 'sweetalert2';
import Navbar2 from './Navbar2';

const OrdersList = () => {
  const [filterState, setFilterState] = useState('');
  const [trackingNumbers, setTrackingNumbers] = useState({});
  const [selectedStates, setSelectedStates] = useState({});
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.ordersGeneral);
  console.log(orders)
  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleUpdateOrderState = (id_orderDetail, newState, trackingNumber) => {
    const validStates = ['Pedido Realizado', 'En Preparación', 'Listo para entregar', 'Envío Realizado', 'Retirado'];
    if (!validStates.includes(newState)) {
      alert('Estado inválido');
      return;
    }

    if (newState === 'Envío Realizado' && !trackingNumber) {
      alert('Por favor, ingrese el número de seguimiento.');
      return;
    }

    dispatch(updateOrderState(id_orderDetail, newState, trackingNumber))
      .then(() => {
        dispatch(fetchAllOrders());
        Swal.fire({
          title: 'Success',
          text: 'Cambio de estado exitoso!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      });
  };

  const handleTrackingNumberChange = (id_orderDetail, value) => {
    setTrackingNumbers({
      ...trackingNumbers,
      [id_orderDetail]: value,
    });
  };

  const handleStateChange = (id_orderDetail, newState) => {
    setSelectedStates({
      ...selectedStates,
      [id_orderDetail]: newState,
    });
  };

  const getAvailableStates = (currentState) => {
    const states = ['Pedido Realizado', 'En Preparación', 'Listo para entregar', 'Envío Realizado', 'Retirado'];
    return states.filter(state => state !== currentState);
  };

  const filteredOrders = orders.filter(order => {
    if (!filterState) {
      return true; 
    }
    return order.state_order === filterState; 
  });

  const handleFilterChange = (e) => {
    setFilterState(e.target.value);
  };

  if (loading) {
    return <p className="text-center mt-4">Cargando órdenes...</p>;
  }

  if (error) {
    return <p className="text-center mt-4 text-red-500">Error al cargar órdenes: {error}</p>;
  }

  return (
    <>
      <Navbar2 />
      <div className="bg-gray-400 min-h-screen pt-16 pb-16">
        <div className="container mx-auto px-4 py-8 mt-20">
          <h2 className="text-2xl font-semibold mb-4 font-nunito text-gray-700 bg-slate-300 p-2 rounded">Lista de Pedidos</h2>
          {/* ... (Filtro de estado) ... */}
          <div className="mb-4">
            <label className="mr-2 text-gray-200 font-nunito font-semibold">Filtrar por estado:</label>
            <select
              onChange={handleFilterChange}
              value={filterState}
              className="bg-gray-600 text-gray-200 font-nunito px-2 py-1 rounded"
            >
              <option value="">Todos</option>
              <option value="Pedido Realizado">Pedido Realizado</option>
              <option value="En Preparación">En Preparación</option>
              <option value="Listo para entregar">Listo para entregar</option>
              <option value="Envío Realizado">Envío Realizado</option>
              <option value="Retirado">Retirado</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Verifica si hay órdenes filtradas antes de mapear */}
            {filteredOrders && filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <div key={order.id_orderDetail} className={`border rounded p-4 ${order.state_order === 'Envío Realizado' ? 'bg-green-100' : 'bg-white'}`}>
                  {/* ... (Info de la orden: Fecha, Estado, Cantidad, Monto, N° Pedido) ... */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold">Fecha: {order.date}</div>
                    <div className="font-semibold bg-gray-700 text-white px-2 py-1 rounded">Estado Pedido: {order.state_order}</div>
                    {order.user_info && ( // Verifica si user_info existe
                    <div className="mt-1 text-sm text-gray-700">
                      Cliente: {order.user_info.first_name} {order.user_info.last_name}
                    </div>
                  )}
                  </div>
                  <div>Cantidad: {order.quantity}</div>
                  <div>Monto: ${order.amount}</div>
                  <div className="font-semibold">N° Pedido: {order.id_orderDetail}</div>

                  {/* --- SECCIÓN PARA MOSTRAR PRODUCTOS E IMÁGENES --- */}
                  <div className="mt-4 border-t pt-2">
                    <h4 className="text-md font-semibold mb-2">Productos:</h4>
                    {/* Verifica si hay productos en la orden */}
                    {order.products && order.products.length > 0 ? (
                      order.products.map((product, prodIndex) => (
                        <div key={prodIndex} className="flex items-start mb-2">
                          {/* Muestra la primera imagen del producto si existe */}
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]} // Muestra solo la primera imagen
                              alt={product.description}
                              className="w-16 h-16 object-cover rounded-md mr-4 border"
                              onError={(e) => { e.target.style.display = 'none'; }} // Oculta si falla
                            />
                          )}
                          {/* Si no hay imagen, muestra un placeholder o nada */}
                          {(!product.images || product.images.length === 0) && (
                             <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center text-xs text-gray-500">Sin img</div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{product.description}</p>
                            <p className="text-xs text-gray-600">Cod: {product.codigoBarra}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No hay detalles de productos para esta orden.</p>
                    )}
                  </div>
                  {/* --- FIN SECCIÓN PRODUCTOS --- */}


                  {/* ... (Select de estado, Input de tracking, Botones de acción) ... */}
                  <div className="mt-4">
                    <select
                      onChange={(e) => handleStateChange(order.id_orderDetail, e.target.value)}
                      value={selectedStates[order.id_orderDetail] || order.state_order}
                      className="bg-gray-200 text-black px-2 py-1 rounded mr-2"
                      disabled={order.state_order === 'Envío Realizado'}
                    >
                      <option value={order.state_order} disabled>{order.state_order}</option> {/* Muestra el estado actual */}
                      {getAvailableStates(order.state_order).map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleUpdateOrderState(order.id_orderDetail, selectedStates[order.id_orderDetail] || order.state_order, trackingNumbers[order.id_orderDetail])}
                      className="bg-slate-600 text-gray-200 px-4 py-1 rounded font-nunito font-semibold"
                      disabled={order.state_order === 'Envío Realizado' || !selectedStates[order.id_orderDetail] || selectedStates[order.id_orderDetail] === order.state_order}
                    >
                      Actualizar Estado
                    </button>
                  </div>

                  {(selectedStates[order.id_orderDetail] === 'Envío Realizado' || order.state_order === 'Envío Realizado') && (
                    <div className="mt-2 flex items-center">
                      <input
                        type="text"
                        placeholder="Número de seguimiento"
                        value={trackingNumbers[order.id_orderDetail] || order.tracking_number || ''} // Muestra el guardado si existe
                        onChange={(e) => handleTrackingNumberChange(order.id_orderDetail, e.target.value)}
                        className="bg-gray-200 text-black px-2 py-1 rounded mr-2"
                        disabled={order.state_order === 'Envío Realizado'}
                      />
                      {order.state_order !== 'Envío Realizado' && ( // Solo muestra el botón si aún no está enviado
                         <button
                           onClick={() => handleUpdateOrderState(order.id_orderDetail, 'Envío Realizado', trackingNumbers[order.id_orderDetail])}
                           className="bg-blue-500 text-white px-4 py-1 rounded"
                           disabled={!trackingNumbers[order.id_orderDetail]} // Deshabilita si no hay número
                         >
                           Confirmar Envío
                         </button>
                      )}
                       {order.state_order === 'Envío Realizado' && order.tracking_number && (
                         <span className="text-sm text-green-700">Enviado: {order.tracking_number}</span>
                       )}
                    </div>
                  )}

                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No hay órdenes que coincidan con el filtro.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersList;




