import  { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders } from '../../Redux/Actions/actions';
//import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


const OrdenesPendientes = () => {
  const [filterState, setFilterState] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector(state => state.ordersGeneral);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);


  
  const filteredOrders = orders.filter(order => {
    if (!filterState) {
      return order.isFacturable === true; // Solo órdenes facturables
    }
    return order.state_order === filterState && order.isFacturable === true;
  });

  const handleFilterChange = (e) => {
    setFilterState(e.target.value);
  };

  const handleFacturar = () => {
    // Redirigir al formulario de factura con los datos de los productos
    navigate('/invoice'); // Asegúrate de que esta ruta esté configurada en tu routing
      
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
          </select>
        </div>

        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">N° Pedido</th>
                <th scope="col" className="px-6 py-3">Fecha</th>
                <th scope="col" className="px-6 py-3">Cantidad</th>
                <th scope="col" className="px-6 py-3">Monto</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id_orderDetail} className={`bg-white border-b ${order.state_order === 'Envío Realizado' ? 'bg-green-100' : ''}`}>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.id_orderDetail}</td>
                  <td className="px-6 py-4">{order.date}</td>
                  <td className="px-6 py-4">{order.quantity}</td>
                  <td className="px-6 py-4">${order.amount}</td>
                  <td className="px-6 py-4">{order.state_order}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleFacturar(order)} // Botón para facturar
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Facturar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdenesPendientes;
