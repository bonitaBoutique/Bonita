import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Config";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getClientAccountBalance,
  getAllClientAccounts,
} from "../Redux/Actions/actions";
import Navbar2 from "./Navbar2";

const ClientAccountBalance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, orderDetails, loading, error } = useSelector(
    (state) => state.clientAccountBalance
  );
  const allClientAccounts = useSelector(
    (state) => state.allClientAccounts?.data || []
  );
  const [giftCardClients, setGiftCardClients] = useState({});
  const [searchName, setSearchName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filtrar clientes por nombre y apellido
  const filteredClients = allClientAccounts.filter((client) => {
    const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
    return fullName.includes(searchName.toLowerCase());
  });

  useEffect(() => {
    dispatch(getAllClientAccounts());
  }, [dispatch]);

  // Paginación de la lista de clientes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = filteredClients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
const getPageNumbers = () => {
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);

  // Ajustar para siempre mostrar 5 si es posible
  if (currentPage <= 2) {
    end = Math.min(5, totalPages);
  }
  if (currentPage >= totalPages - 1) {
    start = Math.max(1, totalPages - 4);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
};
  // Suma total del saldo de todas las órdenes
  const totalAmount = orderDetails
    ? orderDetails.reduce((acc, order) => acc + (Number(order.amount) || 0), 0)
    : 0;

  // Cantidad total de órdenes
  const totalOrders = orderDetails ? orderDetails.length : 0;

  // Buscar saldo por documento (puedes cambiar esto si quieres buscar por nombre)
  const handleFetchAccountBalance = (nDocument) => {
    dispatch(getClientAccountBalance(nDocument));
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error)
    return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  const checkGiftCard = async (n_document) => {
    try {
      const res = await axios.get(`${BASE_URL}/caja/receipts/giftcard`, {
        params: { n_document },
      });
      setGiftCardClients((prev) => ({
        ...prev,
        [n_document]: res.data.receipts.length > 0,
      }));
    } catch (e) {
      setGiftCardClients((prev) => ({
        ...prev,
        [n_document]: false,
      }));
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar2 />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mt-16 mb-4 text-gray-800">
          Saldo cuenta del cliente
        </h1>

        {/* Formulario de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Nombre o apellido"
          />
        </div>

        {/* Listado de clientes con paginación */}
        <h2 className="text-xl font-bold mt-8 mb-4 text-gray-800">Clientes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Documento</th>
                <th className="py-3 px-6 text-left">Nombre</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Teléfono</th>
                <th className="py-3 px-6 text-left">Ver saldo</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {currentClients.map((client) => (
                <tr
                  key={client.n_document}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {client.n_document}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {client.first_name} {client.last_name}
                  </td>
                  <td className="py-3 px-6 text-left">{client.email}</td>
                  <td className="py-3 px-6 text-left">{client.phone}</td>
                  <td className="py-3 px-6 text-left flex gap-2">
                    <button
                      onClick={() =>
                        handleFetchAccountBalance(client.n_document)
                      }
                      className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
                    >
                      Ver saldo
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/recibo/giftcard/${client.n_document}`)
                      }
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
                    >
                      GiftCard
                    </button>
                    {giftCardClients[client.n_document] && (
                      <span className="text-green-600 font-bold ml-2">
                        GiftCard activa
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-center mt-8">
  <button
    onClick={() => paginate(1)}
    disabled={currentPage === 1}
    className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
  >
    {"<<"}
  </button>
  <button
    onClick={() => paginate(currentPage - 1)}
    disabled={currentPage === 1}
    className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
  >
    {"<"}
  </button>
  {getPageNumbers().map((page) => (
    <button
      key={page}
      onClick={() => paginate(page)}
      className={`mx-1 px-3 py-1 rounded ${
        currentPage === page
          ? "bg-pink-500 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {page}
    </button>
  ))}
  <button
    onClick={() => paginate(currentPage + 1)}
    disabled={currentPage === totalPages}
    className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
  >
    {">"}
  </button>
  <button
    onClick={() => paginate(totalPages)}
    disabled={currentPage === totalPages}
    className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
  >
    {">>"}
  </button>
</div>
        {/* Información del cliente seleccionado */}
        {user && (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8">
            <p className="text-gray-700 font-semibold">
              Nombre:{" "}
              <span className="font-normal">
                {user.first_name} {user.last_name}
              </span>
            </p>
            <p className="text-gray-700 font-semibold">
              Email: <span className="font-normal">{user.email}</span>
            </p>
            <p className="text-gray-700 font-semibold">
              Teléfono: <span className="font-normal">{user.phone}</span>
            </p>
          </div>
        )}

        {/* Totales de órdenes y saldo */}
        {orderDetails && orderDetails.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="bg-white shadow rounded px-4 py-2 font-semibold text-gray-700">
              Total de órdenes: <span className="font-bold">{totalOrders}</span>
            </div>
            <div className="bg-white shadow rounded px-4 py-2 font-semibold text-gray-700">
              Saldo total:{" "}
              <span className="font-bold">${totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Detalles de la orden */}
        {orderDetails && orderDetails.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">ID Order Detail</th>
                  <th className="py-3 px-6 text-left">Fecha</th>
                  <th className="py-3 px-6 text-left">Cantidad</th>
                  <th className="py-3 px-6 text-left">Estado Orden</th>
                  <th className="py-3 px-6 text-left">Reservas</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {orderDetails.map((orderDetail) => (
                  <tr
                    key={orderDetail.id_orderDetail}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {orderDetail.id_orderDetail}
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {new Date(orderDetail.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {orderDetail.amount}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {orderDetail.state_order}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {orderDetail.Reservations &&
                        orderDetail.Reservations.map((reservation) => (
                          <div
                            key={reservation.id_reservation}
                            className="mb-2"
                          >
                            <p>ID: {reservation.id_reservation}</p>
                            <p>Total pagado: {reservation.totalPaid}</p>
                            <p>
                              Fecha de vencimiento:{" "}
                              {new Date(
                                reservation.dueDate
                              ).toLocaleDateString()}
                            </p>
                            <p>Estado: {reservation.status}</p>
                          </div>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAccountBalance;
