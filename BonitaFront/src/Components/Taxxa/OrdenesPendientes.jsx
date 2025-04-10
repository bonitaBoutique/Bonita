import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../Redux/Actions/actions";
import Swal from "sweetalert2";

const OrdenesPendientes = ({ filterType, mode, onSelectOrder }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.ordersGeneral);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleSelectOrder = (orderId) => {
    if (onSelectOrder) {
      onSelectOrder(orderId); // Llamar a la función de callback con el ID de la orden seleccionada
    }
  };

  if (loading) {
    return <p className="text-center mt-4">Cargando órdenes...</p>;
  }

  if (error) {
    return (
      <p className="text-center mt-4 text-red-500">
        Error al cargar órdenes: {error}
      </p>
    );
  }

  if (!orders || orders.length === 0) {
    return <p className="text-center mt-4">No hay órdenes disponibles.</p>;
  }

  let filteredOrders = orders;
  if (filterType === "facturablesPendientes") {
    filteredOrders = orders.filter(
      (order) => order.isFacturable && order.status.trim().toLowerCase() === "pendiente"
    );
  }

  const renderActions = (order) => {
    if (mode === "billingForm") {
      return (
        <button
          onClick={() => handleSelectOrder(order.n_document)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Seleccionar Documento
        </button>
      );
    } else if (mode === "invoice") {
      return (
        <button
          onClick={() => handleSelectOrder(order.id_orderDetail)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Seleccionar Orden
        </button>
      );
    }
    return null;
  };
  return (
    <div className="bg-colorFooter">
      <div className="container mx-auto px-4 py-8 mt-10">
        <h2 className="text-2xl font-semibold mb-4 font-nunito text-gray-900 bg-white p-2 rounded">
          Lista de Pedidos
        </h2>

        <div
          className="overflow-x-auto shadow-md sm:rounded-lg"
          style={{ maxHeight: "500px" }}
        >
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-500">
              <tr>
                <th scope="col" className="px-6 py-3">N° Pedido</th>
                <th scope="col" className="px-6 py-3">Fecha</th>
                <th scope="col" className="px-6 py-3">Cantidad</th>
                <th scope="col" className="px-6 py-3">Monto</th>
                <th scope="col" className="px-6 py-3">Documento Cliente</th>
                <th scope="col" className="px-6 py-3">Punto de Venta</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id_orderDetail} className="bg-white border-b text-black">
                  <td className="px-6 py-4 font-medium text-black">{order.id_orderDetail}</td>
                  <td className="px-6 py-4">{order.date}</td>
                  <td className="px-6 py-4">{order.quantity}</td>
                  <td className="px-6 py-4">${order.amount}</td>
                  <td className="px-6 py-4">{order.n_document}</td>
                  <td className="px-6 py-4">{order.pointOfSale}</td>
                  <td className="px-6 py-4">{order.state_order}</td>
                  <td className="px-6 py-4">{renderActions(order)}</td>
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