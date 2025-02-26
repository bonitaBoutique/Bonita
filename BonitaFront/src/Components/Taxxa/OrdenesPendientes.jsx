import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../Redux/Actions/actions";
import Navbar2 from "../Navbar2";
import Swal from "sweetalert2";

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

  const handleFilterChange = (e) => {
    setFilterState(e.target.value);
  };

  const handleCopyOrderId = async (id_orderDetail) => {
    try {
      // Usar writeText para copiar al portapapeles
      await navigator.clipboard.writeText(id_orderDetail);

      // Mostrar notificación de éxito con Swal
      await Swal.fire({
        icon: "success",
        title: "¡Copiado!",
        text: `ID: ${id_orderDetail}`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#48BB78",
        color: "#fff",
        customClass: {
          popup: "rounded-lg",
        },
      });
    } catch (error) {
      console.error("Error al copiar:", error);

      // Mostrar notificación de error con Swal
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo copiar el ID al portapapeles",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        background: "#F56565",
        color: "#fff",
        customClass: {
          popup: "rounded-lg",
        },
      });

      // Fallback para navegadores que no soportan clipboard API
      try {
        const textArea = document.createElement("textarea");
        textArea.value = id_orderDetail;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        await Swal.fire({
          icon: "success",
          title: "¡Copiado!",
          text: `ID: ${id_orderDetail}`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          background: "#48BB78",
          color: "#fff",
        });
      } catch (fallbackError) {
        console.error("Error en fallback:", fallbackError);
      }
    }
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

  const facturableOrders = orders.filter((order) => order.isFacturable);

  return (
    <div className="bg-colorFooter ">
      <Navbar2 />
      <div className="container mx-auto px-4 py-8 mt-10">
        <h2 className="text-2xl font-semibold mb-4 font-nunito text-gray-900 bg-white p-2 rounded">
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

        <div
          className="overflow-x-auto shadow-md sm:rounded-lg"
          style={{ maxHeight: "500px" }}
        >
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead
              className="text-xs text-gray-700 uppercase bg-gray-50"
              style={{
                display: "table",
                width: "calc(100% - 0.9em)",
                tableLayout: "fixed",
              }}
            >
              <tr>
                <th scope="col" className="px-6 py-3 " style={{ width: "10%" }}>
                  N° Pedido
                </th>
                <th scope="col" className="px-6 py-3" style={{ width: "15%" }}>
                  Fecha
                </th>

                <th scope="col" className="px-6 py-3" style={{ width: "10%" }}>
                  Cantidad
                </th>
                <th scope="col" className="px-6 py-3" style={{ width: "15%" }}>
                  Monto
                </th>
                <th scope="col" className="px-6 py-3" style={{ width: "20%" }}>
                  Documento Cliente
                </th>
                <th scope="col" className="px-6 py-3" style={{ width: "20%" }}>
                  Punto de Venta
                </th>

                <th scope="col" className="px-6 py-3" style={{ width: "10%" }}>
                  Estado
                </th>
                <th scope="col" className="px-6 py-3" style={{ width: "20%" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody
              style={{
                overflowY: "auto",
                display: "block",
                height: "400px",
                width: "100%",
              }}
            >
              {facturableOrders.map((order) => (
                <tr
                  key={order.id_orderDetail}
                  className="bg-white border-b dark:bg-gray-800  text-white"
                  style={{
                    display: "table",
                    width: "100%",
                    tableLayout: "fixed",
                  }}
                >
                  <td
                    className="px-6 py-4 font-medium text-white"
                    style={{ width: "10%" }}
                  >
                    {order.id_orderDetail}
                  </td>
                  <td className="px-6 py-4" style={{ width: "15%" }}>
                    {order.date}
                  </td>

                  <td className="px-6 py-4" style={{ width: "10%" }}>
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4" style={{ width: "15%" }}>
                    ${order.amount}
                  </td>
                  <td className="px-6 py-4" style={{ width: "20%" }}>
                    {order.n_document}
                  </td>
                  <td className="px-6 py-4" style={{ width: "20%" }}>
                    {order.pointOfSale}{" "}
                  </td>
                  <td className="px-6 py-4" style={{ width: "10%" }}>
                    {order.state_order}
                  </td>
                  <td className="px-6 py-4" style={{ width: "20%" }}>
                    <button
                      onClick={() => handleCopyOrderId(order.id_orderDetail)}
                      className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2 transition-colors duration-200 ${
                        isFacturada(order)
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-lg"
                      }`}
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
            {orders
  .find((order) => order.id_orderDetail === expandedOrder)
  ?.products.map((product) => {
    console.log("Producto:", product); // Agrega este console.log
    return (
      <div
        key={product.id_product}
        className="mb-2 p-4 bg-gray-600 rounded"
      >
        <p className="mb-2">
          <strong>Descripción:</strong> {product.description}
        </p>
        <p className="mb-2">
          <strong>Precio:</strong> ${product.priceSell ? product.priceSell.toLocaleString() : 'N/A'}
        </p>
        <p className="mb-2">
          <strong>ID Producto:</strong> {product.id_product}
        </p>
        <p>
          <strong>Código de Barra:</strong> {product.codigoBarra}
        </p>
      </div>
    );
  })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdenesPendientes;
