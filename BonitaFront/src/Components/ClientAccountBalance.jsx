import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClientAccountBalance, getAllClientAccounts } from '../Redux/Actions/actions';
import Navbar2 from './Navbar2';

const ClientAccountBalance = () => {
  const dispatch = useDispatch();
  const { user, orderDetails, loading, error } = useSelector((state) => state.clientAccountBalance);
  const allClientAccounts = useSelector((state) => state.allClientAccounts?.data || []);

  const [nDocument, setNDocument] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Puedes ajustar este valor

  const handleFetchAccountBalance = () => {
    dispatch(getClientAccountBalance(nDocument));
  };

  useEffect(() => {
    dispatch(getAllClientAccounts());
  }, [dispatch]);

  // Paginación de la lista de clientes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = allClientAccounts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar2 />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mt-16 mb-4 text-gray-800">Saldo cuenta del cliente</h1>

        {/* Formulario de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            value={nDocument}
            onChange={(e) => setNDocument(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="N° de documento"
          />
          <button
            onClick={handleFetchAccountBalance}
            className="mt-2 bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Obtener saldo de cuenta
          </button>
        </div>

        {/* Información del cliente */}
        {user && (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <p className="text-gray-700 font-semibold">Nombre: <span className="font-normal">{user.first_name} {user.last_name}</span></p>
            <p className="text-gray-700 font-semibold">Email: <span className="font-normal">{user.email}</span></p>
            <p className="text-gray-700 font-semibold">Teléfono: <span className="font-normal">{user.phone}</span></p>
          </div>
        )}

        {/* Detalles de la orden */}
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
              {orderDetails && orderDetails.map((orderDetail) => (
                <tr key={orderDetail.id_orderDetail} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{orderDetail.id_orderDetail}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{new Date(orderDetail.date).toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-left">{orderDetail.amount}</td>
                  <td className="py-3 px-6 text-left">{orderDetail.state_order}</td>
                  <td className="py-3 px-6 text-left">
                    {orderDetail.Reservations && orderDetail.Reservations.map((reservation) => (
                      <div key={reservation.id_reservation} className="mb-2">
                        <p>ID: {reservation.id_reservation}</p>
                        <p>Total pagado: {reservation.totalPaid}</p>
                        <p>Fecha de vencimiento: {new Date(reservation.dueDate).toLocaleDateString()}</p>
                        <p>Estado: {reservation.status}</p>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {currentClients.map((client) => (
                <tr key={client.n_document} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{client.n_document}</td>
                  <td className="py-3 px-6 text-left">{client.first_name} {client.last_name}</td>
                  <td className="py-3 px-6 text-left">{client.email}</td>
                  <td className="py-3 px-6 text-left">{client.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-center mt-8">
          {Array.from({ length: Math.ceil(allClientAccounts.length / itemsPerPage) }).map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientAccountBalance;