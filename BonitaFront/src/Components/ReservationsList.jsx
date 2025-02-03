import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllReservations, applyPayment, createReceipt, deleteReservation, updateReservation } from '../Redux/Actions/actions';

const ReservationList = () => {
  const dispatch = useDispatch();
  const reservations = useSelector((state) => state.reservation.list);
  const loading = useSelector((state) => state.reservation.loading);
  const error = useSelector((state) => state.reservation.error);
  const [paymentAmounts, setPaymentAmounts] = useState({});

  useEffect(() => {
    dispatch(getAllReservations());
  }, [dispatch]);

  console.log(reservations);

  const handlePayment = async (id_reservation) => {
    const amount = parseFloat(paymentAmounts[id_reservation]) || 0;
    console.log("Sending payment request:", { id_reservation, amount });
    await dispatch(applyPayment(id_reservation, amount));
    await dispatch(createReceipt(id_reservation, amount)); // Create and send the receipt
  };

  const handleDelete = async (id_reservation) => {
    await dispatch(deleteReservation(id_reservation));
  };

  const handleUpdateStatus = async (id_reservation, status) => {
    await dispatch(updateReservation(id_reservation, status));
  };

  const handlePaymentAmountChange = (id_reservation, amount) => {
    setPaymentAmounts({
      ...paymentAmounts,
      [id_reservation]: amount,
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto p-4 mt-12">
      <h1 className="text-2xl font-bold mb-4">Reservas</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Id Orden</th>
              <th className="py-2 px-4 border-b">Id Reserva</th>
              <th className="py-2 px-4 border-b">Vencimiento</th>
              <th className="py-2 px-4 border-b">Pago Total</th>
              <th className="py-2 px-4 border-b">Monto Orden</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations && reservations.map((reservation) => (
              <tr key={reservation.id_reservation}>
                <td className="py-2 px-4 border-b">{reservation.id_orderDetail}</td>
                <td className="py-2 px-4 border-b">{reservation.id_reservation}</td>
                <td className="py-2 px-4 border-b">{new Date(reservation.dueDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{reservation.totalPaid}</td>
                <td className="py-2 px-4 border-b">{reservation.OrderDetail ? reservation.OrderDetail.amount : 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  <input
                    type="number"
                    value={paymentAmounts[reservation.id_reservation] || ''}
                    onChange={(e) => handlePaymentAmountChange(reservation.id_reservation, e.target.value)}
                    className="border rounded px-2 py-1 mr-2"
                    placeholder="Payment Amount"
                  />
                  <button
                    onClick={() => handlePayment(reservation.id_reservation)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                  >
                    Pay
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(reservation.id_reservation, 'Completada')}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mr-2"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleDelete(reservation.id_reservation)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationList;