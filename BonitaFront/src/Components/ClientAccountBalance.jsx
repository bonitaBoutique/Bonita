import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClientAccountBalance, getAllClientAccounts } from '../Redux/Actions/actions';
import Navbar2 from './Navbar2';

const ClientAccountBalance = () => {
  const dispatch = useDispatch();
  const { user, orderDetails, loading, error } = useSelector((state) => state.clientAccountBalance);
  const allClientAccounts = useSelector((state) => 
    state.allClientAccounts?.data || []
  );
  const [nDocument, setNDocument] = useState('');

  const handleFetchAccountBalance = () => {
    dispatch(getClientAccountBalance(nDocument));
  };

  useEffect(() => {
    dispatch(getAllClientAccounts());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <Navbar2 />
      <h1 className="text-xl font-bold mt-16 mb-4 bg-slate-300">Saldo cuenta del cliente</h1>
      <div className="mb-4">
        <input
          type="text"
          value={nDocument}
          onChange={(e) => setNDocument(e.target.value)}
          className="border rounded px-2 py-1 mr-2"
          placeholder="N° de documento"
        />
        <button
          onClick={handleFetchAccountBalance}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Obtener saldo de cuenta
        </button>
      </div>
      {user && (
        <div className="mb-4">
          <p><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Telefono:</strong> {user.phone}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">ID Order Detail</th>
              <th className="py-2 px-4 border-b text-left">Fecha</th>
              <th className="py-2 px-4 border-b text-left">Cantidad</th>
              <th className="py-2 px-4 border-b text-left">Estado Orden</th>
              <th className="py-2 px-4 border-b text-left">Reservas</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails && orderDetails.map((orderDetail) => (
              <tr key={orderDetail.id_orderDetail}>
                <td className="py-2 px-4 border-b">{orderDetail.id_orderDetail}</td>
                <td className="py-2 px-4 border-b">{new Date(orderDetail.date).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{orderDetail.amount}</td>
                <td className="py-2 px-4 border-b">{orderDetail.state_order}</td>
                <td className="py-2 px-4 border-b">
                  {orderDetail.Reservations && orderDetail.Reservations.map((reservation) => (
                    <div key={reservation.id_reservation}>
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
      <h2 className="text-xl font-bold mt-8 mb-4 bg-slate-300">Clientes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Documento</th>
              <th className="py-2 px-4 border-b text-left">Nombre</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(allClientAccounts) && allClientAccounts.map((client) => (
              <tr key={client.n_document}>
                <td className="py-2 px-4 border-b">{client.n_document}</td>
                <td className="py-2 px-4 border-b">{client.first_name} {client.last_name}</td>
                <td className="py-2 px-4 border-b">{client.email}</td>
                <td className="py-2 px-4 border-b">{client.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientAccountBalance;
