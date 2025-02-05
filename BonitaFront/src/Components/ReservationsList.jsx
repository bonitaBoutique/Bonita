import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllReservations,
  applyPayment,
  createReceipt,
  deleteReservation,
  updateReservation,
  fetchLatestReceipt,
  fetchOrdersByIdOrder,
} from "../Redux/Actions/actions";
import jsPDF from "jspdf";
import Swal from "sweetalert2";

const ReservationList = () => {
  const dispatch = useDispatch();
  const reservations = useSelector((state) => state.reservation.list);
  const loading = useSelector((state) => state.reservation.loading);
  const error = useSelector((state) => state.reservation.error);
  const latestReceipt = useSelector((state) => state.receiptNumber);
  const orderDetails = useSelector((state) => state.orderById.orderDetail);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [hoveredOrderId, setHoveredOrderId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });


  useEffect(() => {
    dispatch(getAllReservations());
    dispatch(fetchLatestReceipt());
  }, [dispatch]);

  console.log(latestReceipt);

  const handlePayment = async (id_reservation) => {
    const amount = parseFloat(paymentAmounts[id_reservation]) || 0;
    console.log("Sending payment request:", { id_reservation, amount });
    await dispatch(applyPayment(id_reservation, amount));

    // Obtener la reserva actualizada
    const updatedReservation = reservations.find(
      (res) => res.id_reservation === id_reservation
    );

    // Obtener el número de recibo más reciente y sumarle uno
    const receiptNumber = latestReceipt ? latestReceipt + 1 : 1001;

    // Crear y enviar el recibo
    const receiptData = {
      receiptNumber, // Usar el número de recibo actualizado
      id_orderDetail: updatedReservation.id_orderDetail,
      total_amount: amount,
      buyer_name:
        updatedReservation.OrderDetail.User.first_name +
        " " +
        updatedReservation.OrderDetail.User.last_name,
      buyer_email: updatedReservation.OrderDetail.User.email,
      buyer_phone: updatedReservation.OrderDetail.User.phone,
      payMethod: "Crédito",
      date: new Date().toISOString().split("T")[0], // Usar la fecha del día en formato YYYY-MM-DD
    };
    console.log("Creating receipt with data:", receiptData);
    await dispatch(createReceipt(receiptData));

    // Mostrar alerta de que el recibo está listo para descargar
    Swal.fire({
      title: "Recibo Creado",
      text: "El recibo está listo para descargar.",
      icon: "success",
      confirmButtonText: "Descargar",
    }).then((result) => {
      if (result.isConfirmed) {
        generatePDF(receiptData);
      }
    });

    // Verificar si el total pagado es igual al monto de la orden
    if (
      updatedReservation.totalPaid + amount >=
      updatedReservation.OrderDetail.amount
    ) {
      await dispatch(updateReservation(id_reservation, "Completada"));
    }
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

  const handleMouseEnter = (id_orderDetail, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY,
    });
    setHoveredOrderId(id_orderDetail);
    dispatch(fetchOrdersByIdOrder(id_orderDetail));
  };

  const handleMouseLeave = () => {
    setHoveredOrderId(null);
  };

  const generatePDF = (receiptData) => {
    const {
      receiptNumber,
      date,
      buyer_name,
      buyer_email,
      buyer_phone,
      total_amount,
      payMethod,
      id_orderDetail,
    } = receiptData;

    // Crear un nuevo documento PDF con tamaño 80x297 mm
    const doc = new jsPDF({
      unit: "pt", // Establecer la unidad a puntos
      format: [226.77, 839.28], // Definir el tamaño del recibo en puntos (80 x 297 mm)
    });

    // Título centrado en la parte superior
    doc.setFontSize(18);
    doc.text("Bonita Boutique", doc.internal.pageSize.width / 2, 30, {
      align: "center",
    });

    // Información adicional centrada y más pequeña
    doc.setFontSize(10);
    let currentY = 50; // Posición inicial

    doc.text(
      "Bonita Boutique  S.A.S NIT:",
      doc.internal.pageSize.width / 2,
      currentY,
      { align: "center" }
    );
    currentY += 20; // Espacio mayor entre líneas

    doc.text("901832769-3", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    doc.text("Cel: 3118318191", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 30; // Más espacio antes de la sección siguiente

    // Número de recibo centrado
    doc.text(
      `RECIBO # ${receiptNumber}`,
      doc.internal.pageSize.width / 2,
      currentY,
      { align: "center" }
    );
    currentY += 20;

    // Fecha y estado de la venta
    doc.text(`Fecha: ${date}`, doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    doc.text(
      `Estado de venta: ${payMethod}`,
      doc.internal.pageSize.width / 2,
      currentY,
      { align: "center" }
    );

    // Línea de asteriscos
    currentY += 20; // Espacio antes de la línea
    doc.text(
      "***************************",
      doc.internal.pageSize.width / 2,
      currentY,
      { align: "center" }
    );
    currentY += 20; // Espacio después de la línea

    // Detalles del recibo
    doc.setFontSize(10); // Tamaño de fuente más pequeño para los detalles
    doc.text(`Nombre del Comprador: ${buyer_name}`, 20, currentY);
    currentY += 20;

    doc.text(`Correo Electrónico: ${buyer_email}`, 20, currentY);
    currentY += 20;

    doc.text(`Teléfono: ${buyer_phone || "N/A"}`, 20, currentY);
    currentY += 20;

    doc.text(`Pago Parcial: $${total_amount}`, 20, currentY);
    currentY += 20;
    doc.text(`Metodo de Pago : ${payMethod}`, 20, currentY);
    currentY += 20;
    doc.setFontSize(8);
    doc.text(`Orden: ${id_orderDetail}`, 20, currentY);

    // Agregar texto final centrado
    currentY += 40; // Espacio mayor antes del mensaje final
    doc.setFontSize(12);
    doc.text(
      "Gracias por elegirnos!",
      doc.internal.pageSize.width / 2,
      currentY,
      { align: "center" }
    );

    // Guardar el PDF con un nombre personalizado que incluye el número de recibo
    const fileName = `Recibo_${receiptNumber}.pdf`; // Nombre del archivo
    doc.save(fileName);
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
                <td className="py-2 px-4 border-b relative">
                  <button
                    onMouseEnter={(e) => handleMouseEnter(reservation.id_orderDetail, e)}
                    onMouseLeave={handleMouseLeave}
                    className="text-blue-500 underline hover:text-blue-700"
                  >
                    {reservation.id_orderDetail}
                  </button>
                </td>
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
                    onClick={() => generatePDF({
                      receiptNumber: reservation.receiptNumber || 1001,
                      date: new Date().toISOString().split('T')[0],
                      buyer_name: reservation.OrderDetail.User.first_name + ' ' + reservation.OrderDetail.User.last_name,
                      buyer_email: reservation.OrderDetail.User.email,
                      buyer_phone: reservation.OrderDetail.User.phone,
                      total_amount: reservation.totalPaid,
                      payMethod: "Crédito",
                      id_orderDetail: reservation.id_orderDetail
                    })}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mr-2"
                  >
                    Generate PDF
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
  
      {/* Tooltip */}
      {reservations.map((reservation) => (
            <tr key={reservation.id_reservation}>
              <td
                className="py-2 px-4 border-b relative"
                onMouseEnter={(e) => handleMouseEnter(reservation.id_orderDetail, e)}
                onMouseLeave={handleMouseLeave}
              >
                {reservation.id_orderDetail}

                {/* Tooltip */}
                {hoveredOrderId === reservation.id_orderDetail && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${tooltipPosition.x}px`,
                      top: `${tooltipPosition.y}px`,
                      zIndex: 50,
                    }}
                    className="bg-gray-700 text-white p-2 rounded-md shadow-lg"
                  >
                    <p>Detalles de la Orden:</p>
                    <p>Id: {orderDetails?.id}</p>
                    <p>Monto: {orderDetails?.amount}</p>
                    <p>Cliente: {orderDetails?.User?.first_name}</p>
                  </div>
                )}
              </td>
              <td className="py-2 px-4 border-b">{reservation.id_reservation}</td>
            </tr>
          ))}
    </div>
  );
};

export default ReservationList;
