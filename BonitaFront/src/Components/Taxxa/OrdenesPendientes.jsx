import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../Redux/Actions/actions";
import Navbar2 from "../Navbar2";
// import Swal from 'sweetalert2';

const OrdenesPendientes = () => {
  const [filterState, setFilterState] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null); // Para controlar qué orden está expandida
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(
    (state) => state.ordersGeneral
  );

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const filteredOrders = orders.filter((order) => {
    if (!filterState) {
      return order.isFacturable === true; // Solo órdenes facturables
    }
    return order.state_order === filterState && order.isFacturable === true;
  });

  const handleFilterChange = (e) => {
    setFilterState(e.target.value);
  };

  const handleCopyOrderId = (id_orderDetail) => {
    navigator.clipboard.writeText(id_orderDetail);
    alert(`ID de la orden copiado: ${id_orderDetail}`); // Notificación rápida
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId); // Expandir/contraer
  };

  const isFacturada = (order) => !order.isFacturable; // Orden ya facturada

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

  return (
    <>
   <Navbar2/>
    <div className="bg-colorFooter ">
      <div className="container mx-auto px-4 py-8 mt-10">
        <h2 className="text-2xl font-semibold mb-4 font-nunito text-gray-300 bg-colorDetalle p-2 rounded">
          Lista de Pedidos
        </h2>
        <div className="mb-4">
          <label className="mr-2 text-gray-200 font-nunito font-semibold">
            Filtrar por estado:
          </label>
          <select
            onChange={handleFilterChange}
            value={filterState}
            className="bg-gray-600 text-gray-200 font-nunito px-2 py-1 rounded"
          >
            <option value="">Todos</option>
            <option value="Pedido Realizado">Pedido Realizado</option>
            <option value="Envío Realizado">Envío Realizado</option>
          </select>
        </div>

        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 ">
                  N° Pedido
                </th>
                <th scope="col" className="px-6 py-3">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3">
                  Cantidad
                </th>
                <th scope="col" className="px-6 py-3">
                  Monto
                </th>
                <th scope="col" className="px-6 py-3">
                  Documento Cliente
                </th>
                <th scope="col" className="px-6 py-3">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id_orderDetail}
                  className="bg-white border-b dark:bg-gray-800  text-white"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {order.id_orderDetail}
                  </td>
                  <td className="px-6 py-4">{order.date}</td>
                  <td className="px-6 py-4">{order.quantity}</td>
                  <td className="px-6 py-4">${order.amount}</td>
                  <td className="px-6 py-4">
                    {order.n_document }
                  </td>
                  <td className="px-6 py-4">{order.state_order}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleCopyOrderId(order.id_orderDetail)}
                      className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                      disabled={isFacturada(order)}
                    >
                      Copiar ID
                    </button>
                    <button
                      onClick={() => toggleOrderDetails(order.id_orderDetail)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      {expandedOrder === order.id_orderDetail
                        ? "Ocultar"
                        : "Ver Productos"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expandedOrder && (
          <div className="mt-4 bg-gray-700 text-gray-200 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">
              Productos de la Orden:
            </h3>
            {filteredOrders
              .find((order) => order.id_orderDetail === expandedOrder)
              ?.products.map((product) => (
                <div key={product.id_product} className="mb-2">
                  <p>
                    <strong>Descripción:</strong> {product.description}
                  </p>
                  <p>
                    <strong>Precio:</strong> ${product.price}
                  </p>
                  <p>
                    <strong>ID Producto:</strong> {product.id_product}
                  </p>
                  <p>
                    <strong>Codigo de Barra:</strong> {product.codigoBarra}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default OrdenesPendientes;
