import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClientAccountBalance, getAllClientAccounts } from '../Redux/Actions/actions';

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
      <h1 className="text-2xl font-bold mb-4">Client Account Balance</h1>
      <div className="mb-4">
        <input
          type="text"
          value={nDocument}
          onChange={(e) => setNDocument(e.target.value)}
          className="border rounded px-2 py-1 mr-2"
          placeholder="Enter n_document"
        />
        <button
          onClick={handleFetchAccountBalance}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Fetch Account Balance
        </button>
      </div>
      {user && (
        <div className="mb-4">
          <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID Order Detail</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">State Order</th>
              <th className="py-2 px-4 border-b">Reservations</th>
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
                      <p>Total Paid: {reservation.totalPaid}</p>
                      <p>Due Date: {new Date(reservation.dueDate).toLocaleDateString()}</p>
                      <p>Status: {reservation.status}</p>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="text-xl font-bold mt-8 mb-4">All Client Accounts</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">n_document</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Phone</th>
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
