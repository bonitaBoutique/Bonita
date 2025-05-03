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
  const reservations = useSelector((state) => state.reservation.list) || [];
  const loading = useSelector((state) => state.reservation.loading);
  const error = useSelector((state) => state.reservation.error);
  const latestReceipt = useSelector((state) => state.receiptNumber);
  const orderDetails = useSelector((state) => state.orderById.orderDetail);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [hoveredOrderId, setHoveredOrderId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentOrderDetail, setCurrentOrderDetail] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null); // Estado para la reserva seleccionada
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false); // Estado para el popup de pago
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [reservationsPerPage] = useState(7); // Estado para el número de reservas por página
  const { userInfo } = useSelector((state) => state.userLogin);
  useEffect(() => {
    dispatch(getAllReservations());
    dispatch(fetchLatestReceipt());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && !error && reservations && reservations.length === 0) {
      Swal.fire({
        title: 'Sin Reservas',
        text: 'No hay reservas para mostrar en este momento',
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });
    }
  }, [reservations, loading, error]);
  console.log(latestReceipt);

  const calculatePendingDebt = (totalAmount, paidAmount) => {
    return totalAmount - paidAmount;
  };

  useEffect(() => {
    if (orderDetails) {
      console.log('OrderDetails actualizado:', orderDetails);
      setCurrentOrderDetail(orderDetails);
    }
  }, [orderDetails]);

  const handleOpenPaymentPopup = (reservation) => {
    setSelectedReservation(reservation);
    setIsPaymentPopupOpen(true);
  };

  const handleClosePaymentPopup = () => {
    setSelectedReservation(null);
    setIsPaymentPopupOpen(false);
  };

  const handlePayment = async (id_reservation, amount, paymentMethod) => {
    console.log("Sending payment request:", { id_reservation, amount, paymentMethod });
    try {
      await dispatch(applyPayment(id_reservation, amount, paymentMethod));

      // Obtener la reserva actualizada del estado global
      const updatedReservation = reservations.find(
        (res) => res.id_reservation === id_reservation
      );

      // Si la reserva actualizada no se encuentra en el estado global, no hacer nada
      if (!updatedReservation) {
        console.warn(`Reserva con ID ${id_reservation} no encontrada en el estado global.`);
        return;
      }

      // Obtener el número de recibo más reciente y sumarle uno
      const receiptNumber = latestReceipt ? latestReceipt + 1 : 1001;

      // Crear y enviar el recibo
      const receiptData = {
        receiptNumber,
        id_orderDetail: updatedReservation.id_orderDetail,
        total_amount: amount,
        amount, // <--- este campo es obligatorio para el backend
        buyer_name: updatedReservation.OrderDetail.User.first_name + " " + updatedReservation.OrderDetail.User.last_name,
        buyer_email: updatedReservation.OrderDetail.User.email,
        buyer_phone: updatedReservation.OrderDetail.User.phone,
        payMethod: paymentMethod,
        date: new Date().toISOString().split("T")[0],
        cashier_document: userInfo?.n_document || "ADMIN",
      };

      // Mostrar alerta de que el recibo está listo para descargar
      const saldoPendiente = updatedReservation.OrderDetail.amount - (updatedReservation.totalPaid + amount);

Swal.fire({
  title: "Recibo Creado",
  text: "El recibo está listo para descargar.",
  icon: "success",
  confirmButtonText: "Descargar",
}).then((result) => {
  if (result.isConfirmed) {
    generatePDF({
      ...receiptData,
      saldoPendiente, 
    });
  }
});

      // Verificar si el total pagado es igual al monto de la orden
      if (
        updatedReservation.totalPaid + amount >=
        updatedReservation.OrderDetail.amount
      ) {
        await dispatch(updateReservation(id_reservation, "Completada"));
      }

      handleClosePaymentPopup();
    } catch (error) {
      console.error("Error al aplicar el pago:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo aplicar el pago. Por favor, inténtalo de nuevo.",
        icon: "error",
      });
    }
  };

  const handleDelete = async (id_reservation) => {
    await dispatch(deleteReservation(id_reservation));
  };

  const handleUpdateStatus = async (id_reservation, status) => {
    await dispatch(updateReservation(id_reservation, status));
  };

  const handleMouseEnter = async (id_orderDetail, event) => {
    try {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left,
        y: rect.bottom + window.scrollY + 5
      });
      setHoveredOrderId(id_orderDetail);

      // Limpiar el detalle actual mientras carga
      setCurrentOrderDetail(null);

      const result = await dispatch(fetchOrdersByIdOrder(id_orderDetail));
      console.log('Fetched order details:', result);

      if (result) {
        setCurrentOrderDetail(result);
      }
    } catch (error) {
      console.error('Error en handleMouseEnter:', error);
      setCurrentOrderDetail(null);
    }
  };

  // Añadir este useEffect para manejar los cambios en orderDetails
  useEffect(() => {
    if (orderDetails) {
      const orderData = {
        userData: {
          first_name: orderDetails.userData?.first_name || '',
          last_name: orderDetails.userData?.last_name || ''
        },
        n_document: orderDetails.n_document,
        products: orderDetails.products || []
      };
      setCurrentOrderDetail(orderData);
    }
  }, [orderDetails]);


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
      saldoPendiente,
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
      align: "center"
    });
    currentY += 20;

    doc.text("Cel: 3118318191", doc.internal.pageSize.width / 2, currentY, {
      align: "center"
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
      align: "center"
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
    doc.text(` ${buyer_name}`, 20, currentY);
    currentY += 20;

    doc.text(` ${buyer_email}`, 20, currentY);
    currentY += 20;

    doc.text(` ${buyer_phone || "N/A"}`, 20, currentY);
    currentY += 20;

    doc.text(`Pago Parcial: $${total_amount}`, 20, currentY);
currentY += 20;
doc.text(`Saldo Pendiente: $${saldoPendiente}`, 20, currentY); // <-- agrega esta línea
currentY += 20;
doc.text(`Metodo de Pago : ${payMethod}`, 20, currentY);
currentY += 20;
    doc.text(`${id_orderDetail}`, 20, currentY);

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
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  // Lógica para la paginación
  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = reservations.slice(indexOfFirstReservation, indexOfLastReservation);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


  console.log("RESERVATIONS:", reservations);
console.log("CURRENT RESERVATIONS:", currentReservations);

  return (
    <div className="container mx-auto p-4 mt-12">
      <h1 className="text-2xl font-bold mb-4">Reservas</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Id Orden</th>
              <th className="py-2 px-4 border-b">Cliente </th>
              <th className="py-2 px-4 border-b">Vencimiento</th>
              <th className="py-2 px-4 border-b">Parcial</th>
              <th className="py-2 px-4 border-b">Monto Orden</th>
              <th className="py-2 px-4 border-b">Deuda Pendiente</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentReservations && currentReservations.map((reservation) => {
              const pendingDebt = calculatePendingDebt(
                reservation.OrderDetail?.amount || 0,
                reservation.totalPaid || 0
              );

              return (
                <tr key={reservation.id_reservation}>
  <td className="py-2 px-4 border-b relative">
    <button
      onMouseEnter={(e) => handleMouseEnter(reservation.id_orderDetail, e)}
      onMouseLeave={handleMouseLeave}
      className="text-blue-500 underline hover:text-blue-700"
    >
      {reservation.id_orderDetail}
    </button>

    {hoveredOrderId === reservation.id_orderDetail && (
      <div
        style={{
          position: "fixed",
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
          zIndex: 1000,
        }}
        className="bg-gray-700 text-white p-3 rounded-md shadow-lg min-w-[300px]"
      >
        <div className="space-y-2">
          <p className="font-semibold border-b pb-1">Detalles de la Orden:</p>

          {currentOrderDetail ? (
            <>
              <div className="mb-2">
                <p className="font-medium text-gray-300">Cliente:</p>
                <p>{`${currentOrderDetail.userData?.first_name || 'N/A'} ${currentOrderDetail.userData?.last_name || 'N/A'}`}</p>
                <p className="text-sm text-gray-400">Doc: {currentOrderDetail.n_document || 'N/A'}</p>
              </div>

              {currentOrderDetail.products && currentOrderDetail.products.length > 0 ? (
                <div>
                  <p className="font-medium text-gray-300 border-b pb-1">Productos:</p>
                  {currentOrderDetail.products.map((product, index) => (
                    <div key={index} className="pl-2 py-1">
                      <p className="text-sm">{product.description || 'Sin descripción'}</p>
                      <div className="text-xs text-gray-400">
                        <p>Código: {product.codigoBarra || 'N/A'}</p>
                        <p>Precio: ${product.priceSell?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No hay productos disponibles</p>
              )}
            </>
                          ) : (
                            <p className="text-sm text-gray-400">Cargando detalles...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
          {reservation.OrderDetail?.User
            ? `${reservation.OrderDetail.User.first_name} ${reservation.OrderDetail.User.last_name}`
            : 'N/A'}
        </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(reservation.dueDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ${reservation.totalPaid?.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ${reservation.OrderDetail?.amount?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="py-2 px-4 border-b text-red-600 font-semibold">
                    ${pendingDebt?.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleOpenPaymentPopup(reservation)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                    >
                      Aplicar Pago
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
                      Generar Recibo
                    </button>
                    <button
                      onClick={() => handleDelete(reservation.id_reservation)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(reservations.length / reservationsPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Popup de Pago */}
      {isPaymentPopupOpen && selectedReservation && (
        <PaymentPopup
          reservation={selectedReservation}
          onClose={handleClosePaymentPopup}
          onPayment={handlePayment}
        />
      )}
    </div>
  );
};

// Componente para el Popup de Pago
const PaymentPopup = ({ reservation, onClose, onPayment }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount) || 0;
    onPayment(reservation.id_reservation, amount, paymentMethod);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Aplicar Pago</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Monto a Pagar</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tipo de Pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta de Débito o Crédito</option>
              <option value="Addi">Addi</option>
              <option value="Sistecredito">Sistecredito</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Aplicar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationList;