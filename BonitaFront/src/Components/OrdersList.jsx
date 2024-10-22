import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderState } from '../Redux/Actions/actions';
import Swal from 'sweetalert2';

const OrdersList = () => {
  const [filterState, setFilterState] = useState('');
  const [trackingNumbers, setTrackingNumbers] = useState({});
  const [selectedStates, setSelectedStates] = useState({});
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.ordersGeneral);

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
    <div className="bg-colorFooter min-h-screen pt-16 pb-16">
      <div className="container mx-auto px-4 py-8 mt-20">
        <h2 className="text-2xl font-semibold mb-4 font-nunito text-gray-300 bg-colorDetalle p-2 rounded">Lista de Pedidos</h2>
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
          {filteredOrders.map(order => (
            <div key={order.id_orderDetail} className={`border rounded p-4 ${order.state_order === 'Envío Realizado' ? 'bg-green-100' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Fecha: {order.date}</div>
                <div className="font-semibold bg-gray-700 text-white px-2 py-1 rounded">Estado Pedido: {order.state_order}</div>
              </div>
              <div>Cantidad: {order.quantity}</div>
              <div>Monto: ${order.amount}</div>
              <div className="font-semibold">N° Pedido: {order.id_orderDetail}</div>
              <div>
                <select
                  onChange={(e) => handleStateChange(order.id_orderDetail, e.target.value)}
                  value={selectedStates[order.id_orderDetail] || order.state_order}
                  className="bg-gray-200 text-black px-2 py-1 rounded"
                  disabled={order.state_order === 'Envío Realizado'}
                >
                  <option value="" disabled>Selecciona un estado</option>
                  {getAvailableStates(order.state_order).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              {(selectedStates[order.id_orderDetail] === 'Envío Realizado' || order.state_order === 'Envío Realizado') && (
                <div className="mt-2">
                 <input
                  type="text"
                  placeholder="Número de seguimiento"
                  value={trackingNumbers[order.id_orderDetail] || ''}
                  onChange={(e) => handleTrackingNumberChange(order.id_orderDetail, e.target.value)}
                  className="bg-gray-200 text-black px-2 py-1 rounded"
                  disabled={order.state_order === 'Envío Realizado'}
                />
                <button
                  onClick={() => handleUpdateOrderState(order.id_orderDetail, 'Envío Realizado', trackingNumbers[order.id_orderDetail])}
                  className="ml-2 bg-yellow-200 text-black px-4 py-2 rounded"
                  disabled={order.state_order === 'Envío Realizado'}
                >
                  {order.state_order === 'Envío Realizado' ? 'Número Enviado' : 'Confirmar Número de Seguimiento'}
                </button>
                </div>
              )}
              <button
                onClick={() => handleUpdateOrderState(order.id_orderDetail, selectedStates[order.id_orderDetail] || order.state_order)}
                className="mt-2 bg-yellow-600 text-gray-800 px-4 py-2 rounded font-nunito font-semibold"
                disabled={order.state_order === 'Envío Realizado'}
              >
                Confirmar Cambio de Estado
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersList;




