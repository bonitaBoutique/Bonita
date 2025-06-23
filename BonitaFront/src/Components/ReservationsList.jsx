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
        title: "Sin Reservas",
        text: "No hay reservas para mostrar en este momento",
        icon: "info",
        confirmButtonText: "Aceptar",
      });
    }
  }, [reservations, loading, error]);
  console.log(latestReceipt);

  const calculatePendingDebt = (totalAmount, paidAmount) => {
    return totalAmount - paidAmount;
  };

  useEffect(() => {
    if (orderDetails) {
      console.log("OrderDetails actualizado:", orderDetails);
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
  console.log("Sending payment request:", {
    id_reservation,
    amount,
    paymentMethod,
  });
  try {
    // ✅ APLICAR EL PAGO PRIMERO
    await dispatch(applyPayment(id_reservation, amount, paymentMethod));

    // ✅ OBTENER LA RESERVA ACTUALIZADA
    const updatedReservation = reservations.find(
      (res) => res.id_reservation === id_reservation
    );

    if (!updatedReservation) {
      console.warn(`Reserva con ID ${id_reservation} no encontrada en el estado global.`);
      return;
    }

    // ✅ CONSTRUIR EL NOMBRE DEL COMPRADOR CORRECTAMENTE
    const buyerFirstName = updatedReservation.OrderDetail?.User?.first_name || "";
    const buyerLastName = updatedReservation.OrderDetail?.User?.last_name || "";
    const buyerName = `${buyerFirstName} ${buyerLastName}`.trim() || "Cliente no identificado";
    
    console.log("🔍 DEBUG - Datos del comprador:", {
      buyerFirstName,
      buyerLastName,
      buyerName,
      fullReservation: updatedReservation
    });

    // ✅ OBTENER EL NÚMERO DE RECIBO
    const receiptNumber = latestReceipt ? latestReceipt + 1 : 1001;

    // ✅ CREAR DATOS DEL RECIBO CON INFORMACIÓN COMPLETA
    const receiptData = {
      receiptNumber,
      id_orderDetail: updatedReservation.id_orderDetail,
      total_amount: amount,
      amount,
      buyer_name: buyerName, // ✅ Usar el nombre construido correctamente
      buyer_email: updatedReservation.OrderDetail?.User?.email || "sin-email@ejemplo.com",
      buyer_phone: updatedReservation.OrderDetail?.User?.phone || "Sin teléfono",
      payMethod: paymentMethod,
      payMethod2: null, // Para pagos únicos
      amount2: null, // Para pagos únicos
      date: new Date().toISOString().split("T")[0],
      cashier_document: userInfo?.n_document || "ADMIN",
      // ✅ AGREGAR CAMPO PARA IDENTIFICAR COMO PAGO PARCIAL
      tipo_transaccion: "Pago Parcial Reserva"
    };

    console.log("🔍 DEBUG - Datos del recibo a enviar:", receiptData);

    // ✅ CREAR EL RECIBO EN EL BACKEND
    await dispatch(createReceipt(receiptData));

    // ✅ CALCULAR SALDO PENDIENTE
    const saldoPendiente = updatedReservation.OrderDetail.amount - (updatedReservation.totalPaid + amount);

    // ✅ MOSTRAR ALERTA DE ÉXITO
    Swal.fire({
      title: "Recibo Creado",
      text: `Pago aplicado correctamente para ${buyerName}. El recibo está listo para descargar.`,
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

    // ✅ VERIFICAR SI LA RESERVA ESTÁ COMPLETA
    if (updatedReservation.totalPaid + amount >= updatedReservation.OrderDetail.amount) {
      await dispatch(updateReservation(id_reservation, "Completada"));
    }

    // ✅ RECARGAR LAS RESERVAS PARA ACTUALIZAR LA VISTA
    await dispatch(getAllReservations());

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
        y: rect.bottom + window.scrollY + 5,
      });
      setHoveredOrderId(id_orderDetail);

      // Limpiar el detalle actual mientras carga
      setCurrentOrderDetail(null);

      const result = await dispatch(fetchOrdersByIdOrder(id_orderDetail));
      console.log("Fetched order details:", result);

      if (result) {
        setCurrentOrderDetail(result);
      }
    } catch (error) {
      console.error("Error en handleMouseEnter:", error);
      setCurrentOrderDetail(null);
    }
  };

  // Añadir este useEffect para manejar los cambios en orderDetails
  useEffect(() => {
    if (orderDetails) {
      const orderData = {
        userData: {
          first_name: orderDetails.userData?.first_name || "",
          last_name: orderDetails.userData?.last_name || "",
        },
        n_document: orderDetails.n_document,
        products: orderDetails.products || [],
      };
      setCurrentOrderDetail(orderData);
    }
  }, [orderDetails]);

  const handleMouseLeave = () => {
    setHoveredOrderId(null);
  };

  // ✅ CORREGIR la función generatePDF para incluir saldo pendiente
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
    saldoPendiente, // ✅ Recibir el saldo pendiente
  } = receiptData;

  // Crear un nuevo documento PDF con tamaño 80x297 mm
  const doc = new jsPDF({
    unit: "pt",
    format: [226.77, 839.28],
  });

  // Título centrado en la parte superior
  doc.setFontSize(18);
  doc.text("Bonita Boutique", doc.internal.pageSize.width / 2, 30, {
    align: "center",
  });

  // Información adicional centrada y más pequeña
  doc.setFontSize(10);
  let currentY = 50;

  doc.text(
    "Bonita Boutique  S.A.S NIT:",
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );
  currentY += 20;

  doc.text("901832769-3", doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 20;

  doc.text("Cel: 3118318191", doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 30;

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

  // ✅ CAMBIAR "Estado de venta" por "Tipo de Transacción" para pagos parciales
  doc.text(
    `Tipo: Pago Parcial Reserva`,
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );

  // Línea de asteriscos
  currentY += 20;
  doc.text(
    "***************************",
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );
  currentY += 20;

  // Detalles del recibo
  doc.setFontSize(10);
  doc.text(`Cliente: ${buyer_name}`, 20, currentY);
  currentY += 20;

  doc.text(`Email: ${buyer_email}`, 20, currentY);
  currentY += 20;

  doc.text(`Teléfono: ${buyer_phone || "N/A"}`, 20, currentY);
  currentY += 20;

  // ✅ AGREGAR LÍNEA SEPARADORA ANTES DE LOS MONTOS
  doc.text(
    "***************************",
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );
  currentY += 20;

  // ✅ INFORMACIÓN FINANCIERA DEL PAGO PARCIAL
  doc.setFontSize(11);
  doc.text(`Pago Parcial: $${total_amount?.toLocaleString("es-CO")}`, 20, currentY);
  currentY += 20;

  // ✅ AGREGAR SALDO PENDIENTE CON FORMATO DESTACADO
  doc.setFontSize(12);
  doc.text(`Saldo Pendiente: $${saldoPendiente?.toLocaleString("es-CO")}`, 20, currentY);
  currentY += 20;

  doc.setFontSize(10);
  doc.text(`Método de Pago: ${payMethod}`, 20, currentY);
  currentY += 20;

  doc.text(`Orden: ${id_orderDetail}`, 20, currentY);
  currentY += 30;

  // ✅ AGREGAR NOTA INFORMATIVA SOBRE LA RESERVA
  doc.text(
    "***************************",
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );
  currentY += 20;

  doc.setFontSize(9);
  doc.text("NOTA: Este es un pago parcial", doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 15;

  doc.text("de una reserva. El saldo", doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 15;

  doc.text("pendiente debe ser cancelado", doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 15;

  doc.text("para completar la compra.", doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 30;

  // Agregar texto final centrado
  doc.setFontSize(12);
  doc.text(
    "Gracias por elegirnos!",
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );

  // Guardar el PDF con un nombre personalizado que incluye el número de recibo
  const fileName = `Recibo_Parcial_${receiptNumber}.pdf`;
  doc.autoPrint();
  window.open(doc.output("bloburl"), "_blank");
};

  // Lógica para la paginación
  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = reservations.slice(
    indexOfFirstReservation,
    indexOfLastReservation
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  console.log("RESERVATIONS:", reservations);
  console.log("CURRENT RESERVATIONS:", currentReservations);

return (
  <div className="container mx-auto p-4 mt-12">
    <h1 className="text-2xl font-bold mb-4">Reservas</h1>

    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-lg rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 border-b font-semibold text-gray-700">Id Orden</th>
            <th className="py-3 px-4 border-b font-semibold text-gray-700">Cliente</th>
            <th className="py-3 px-4 border-b font-semibold text-gray-700">Vencimiento</th>
            <th className="py-3 px-4 border-b font-semibold text-gray-700">Estado</th>
            <th className="py-3 px-4 border-b font-semibold text-gray-700">Parcial</th>
            <th className="py-3 px-4 border-b font-semibold text-gray-700">Monto Orden</th>
            <th className="py-3 px-4 border-b font-semibold text-gray-700">Deuda Pendiente</th>
            <th className="py-3 px-4 border-b font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentReservations &&
            currentReservations.map((reservation) => {
              const pendingDebt = calculatePendingDebt(
                reservation.OrderDetail?.amount || 0,
                reservation.totalPaid || 0
              );

              // ✅ FORMATEAR FECHA DE VENCIMIENTO CON ZONA HORARIA DE COLOMBIA
              const formatDueDate = (dueDate) => {
                if (!dueDate) return 'N/A';
                
                try {
                  const date = new Date(dueDate);
                  return date.toLocaleDateString('es-CO', {
                    timeZone: 'America/Bogota',
                    year: 'numeric',
                    month: '2-digit', 
                    day: '2-digit'
                  });
                } catch (error) {
                  console.error('Error formatting date:', error);
                  return 'Fecha inválida';
                }
              };

              // ✅ VERIFICAR SI ESTÁ VENCIDA
              const isOverdue = () => {
                if (!reservation.dueDate) return false;
                
                const today = new Date();
                const colombiaToday = new Date(today.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
                const dueDate = new Date(reservation.dueDate);
                
                return dueDate < colombiaToday;
              };

              // ✅ DETERMINAR ESTADO DE LA RESERVA
              const getReservationStatus = () => {
                if (reservation.status === 'Completada') return 'Completada';
                if (reservation.status === 'Cancelada') return 'Cancelada';
                if (isOverdue()) return 'Vencida';
                return 'Pendiente';
              };

              const status = getReservationStatus();

              return (
                <tr 
                  key={reservation.id_reservation} 
                  className={`hover:bg-gray-50 transition-colors ${
                    status === 'Vencida' ? 'bg-red-50' : 
                    status === 'Completada' ? 'bg-green-50' : 
                    status === 'Cancelada' ? 'bg-gray-100' : ''
                  }`}
                >
                  <td className="py-3 px-4 border-b relative">
                    <button
                      onMouseEnter={(e) =>
                        handleMouseEnter(reservation.id_orderDetail, e)
                      }
                      onMouseLeave={handleMouseLeave}
                      className="text-blue-600 underline hover:text-blue-800 font-medium transition-colors"
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
                        className="bg-gray-800 text-white p-4 rounded-lg shadow-xl min-w-[320px] max-w-[400px]"
                      >
                        <div className="space-y-3">
                          <p className="font-semibold border-b border-gray-600 pb-2 text-yellow-300">
                            📋 Detalles de la Orden
                          </p>

                          {currentOrderDetail ? (
                            <>
                              <div className="bg-gray-700 p-2 rounded">
                                <p className="font-medium text-blue-300 mb-1">
                                  👤 Cliente:
                                </p>
                                <p className="text-sm">{`${
                                  currentOrderDetail.userData?.first_name ||
                                  "N/A"
                                } ${
                                  currentOrderDetail.userData?.last_name ||
                                  "N/A"
                                }`}</p>
                                <p className="text-xs text-gray-400">
                                  📄 Doc: {currentOrderDetail.n_document || "N/A"}
                                </p>
                              </div>

                              {currentOrderDetail.products &&
                              currentOrderDetail.products.length > 0 ? (
                                <div className="bg-gray-700 p-2 rounded">
                                  <p className="font-medium text-green-300 border-b border-gray-600 pb-1 mb-2">
                                    🛍️ Productos ({currentOrderDetail.products.length}):
                                  </p>
                                  <div className="max-h-32 overflow-y-auto">
                                    {currentOrderDetail.products.map(
                                      (product, index) => (
                                        <div key={index} className="pl-2 py-1 border-l-2 border-green-400 ml-2 mb-1">
                                          <p className="text-sm font-medium">
                                            {product.description ||
                                              "Sin descripción"}
                                          </p>
                                          <div className="text-xs text-gray-400 flex justify-between">
                                            <span>
                                              📦 {product.codigoBarra || "N/A"}
                                            </span>
                                            <span className="text-green-400">
                                              💰 ${product.priceSell?.toLocaleString() || "0"}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400 bg-gray-700 p-2 rounded">
                                  📦 No hay productos disponibles
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                              <p className="text-sm text-gray-400 ml-2">
                                Cargando detalles...
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  
                  <td className="py-3 px-4 border-b">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-blue-600 font-semibold text-sm">
                          {reservation.OrderDetail?.User?.first_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {reservation.OrderDetail?.User
                            ? `${reservation.OrderDetail.User.first_name} ${reservation.OrderDetail.User.last_name}`
                            : "Cliente no identificado"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {reservation.OrderDetail?.User?.email || "Sin email"}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  {/* ✅ COLUMNA DE VENCIMIENTO MEJORADA */}
                  <td className={`py-3 px-4 border-b ${
                    status === 'Vencida' ? 'text-red-600 font-bold' : 'text-gray-700'
                  }`}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatDueDate(reservation.dueDate)}
                      </span>
                      {status === 'Vencida' && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full mt-1 inline-block">
                          ⚠️ VENCIDA
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* ✅ NUEVA COLUMNA DE ESTADO */}
                  <td className="py-3 px-4 border-b">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      status === 'Completada' 
                        ? 'bg-green-100 text-green-800' 
                        : status === 'Cancelada'
                        ? 'bg-gray-100 text-gray-800'
                        : status === 'Vencida'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {status === 'Completada' && '✅ '}
                      {status === 'Cancelada' && '❌ '}
                      {status === 'Vencida' && '⚠️ '}
                      {status === 'Pendiente' && '⏳ '}
                      {status}
                    </span>
                  </td>
                  
                  <td className="py-3 px-4 border-b">
                    <span className="font-semibold text-green-600">
                      ${reservation.totalPaid?.toLocaleString() || '0'}
                    </span>
                  </td>
                  
                  <td className="py-3 px-4 border-b">
                    <span className="font-semibold">
                      ${reservation.OrderDetail?.amount?.toLocaleString() || "N/A"}
                    </span>
                  </td>
                  
                  <td className="py-3 px-4 border-b">
                    <span className={`font-bold ${
                      pendingDebt > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${pendingDebt?.toLocaleString()}
                    </span>
                    {pendingDebt <= 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        ✅ Pagado completo
                      </div>
                    )}
                  </td>
                  
                  <td className="py-3 px-4 border-b">
                    <div className="flex flex-col space-y-1">
                      {/* ✅ BOTÓN APLICAR PAGO */}
                      <button
                        onClick={() => handleOpenPaymentPopup(reservation)}
                        disabled={status === 'Completada' || status === 'Cancelada'}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          status === 'Completada' || status === 'Cancelada'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title={
                          status === 'Completada' ? 'Reserva ya completada' :
                          status === 'Cancelada' ? 'Reserva cancelada' :
                          'Aplicar pago a esta reserva'
                        }
                      >
                        💳 Aplicar Pago
                      </button>
                      
                      {/* ✅ BOTÓN GENERAR RECIBO */}
                      <button
                        onClick={() => {
                          const currentPendingDebt = calculatePendingDebt(
                            reservation.OrderDetail?.amount || 0,
                            reservation.totalPaid || 0
                          );

                          // ✅ USAR FECHA DE COLOMBIA PARA EL RECIBO
                          const colombiaDate = new Date().toLocaleDateString('es-CO', {
                            timeZone: 'America/Bogota',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          });

                          generatePDF({
                            receiptNumber: reservation.receiptNumber || (latestReceipt ? latestReceipt + 1 : 1001),
                            date: colombiaDate,
                            buyer_name: reservation.OrderDetail?.User 
                              ? `${reservation.OrderDetail.User.first_name} ${reservation.OrderDetail.User.last_name}`
                              : "Cliente no identificado",
                            buyer_email: reservation.OrderDetail?.User?.email || "sin-email@ejemplo.com",
                            buyer_phone: reservation.OrderDetail?.User?.phone || "Sin teléfono",
                            total_amount: reservation.totalPaid || 0,
                            payMethod: "Crédito/Reserva",
                            id_orderDetail: reservation.id_orderDetail,
                            saldoPendiente: currentPendingDebt,
                            dueDate: formatDueDate(reservation.dueDate),
                            status: status
                          });
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-600 transition-colors"
                        title="Generar recibo PDF de la reserva"
                      >
                        📄 Generar Recibo
                      </button>
                      
                      {/* ✅ BOTÓN ELIMINAR */}
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: '¿Estás seguro?',
                            text: `¿Deseas eliminar la reserva de ${reservation.OrderDetail?.User?.first_name || 'este cliente'}?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleDelete(reservation.id_reservation);
                            }
                          });
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors"
                        title="Eliminar esta reserva"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>

    {/* ✅ MENSAJE CUANDO NO HAY RESERVAS */}
    {(!currentReservations || currentReservations.length === 0) && !loading && (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay reservas</h3>
        <p className="text-gray-500">No se encontraron reservas para mostrar en este momento.</p>
      </div>
    )}

    {/* ✅ PAGINACIÓN MEJORADA */}
    {reservations && reservations.length > reservationsPerPage && (
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => currentPage > 1 && paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          ← Anterior
        </button>
        
        {Array.from({
          length: Math.ceil(reservations.length / reservationsPerPage),
        }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`px-3 py-2 rounded ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {index + 1}
          </button>
        ))}
        
        <button
          onClick={() => 
            currentPage < Math.ceil(reservations.length / reservationsPerPage) && 
            paginate(currentPage + 1)
          }
          disabled={currentPage === Math.ceil(reservations.length / reservationsPerPage)}
          className={`px-3 py-2 rounded ${
            currentPage === Math.ceil(reservations.length / reservationsPerPage)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Siguiente →
        </button>
      </div>
    )}

    {/* ✅ ESTADÍSTICAS RÁPIDAS */}
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
        <h4 className="text-sm font-medium text-gray-600">Total Reservas</h4>
        <p className="text-2xl font-bold text-blue-600">{reservations?.length || 0}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
        <h4 className="text-sm font-medium text-gray-600">Completadas</h4>
        <p className="text-2xl font-bold text-green-600">
          {reservations?.filter(r => r.status === 'Completada').length || 0}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
        <h4 className="text-sm font-medium text-gray-600">Pendientes</h4>
        <p className="text-2xl font-bold text-yellow-600">
          {reservations?.filter(r => !r.status || r.status === 'Pendiente').length || 0}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
        <h4 className="text-sm font-medium text-gray-600">Vencidas</h4>
        <p className="text-2xl font-bold text-red-600">
          {reservations?.filter(r => {
            if (!r.dueDate) return false;
            const today = new Date();
            const colombiaToday = new Date(today.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
            const dueDate = new Date(r.dueDate);
            return dueDate < colombiaToday && (!r.status || r.status === 'Pendiente');
          }).length || 0}
        </p>
      </div>
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
);}

// Componente para el Popup de Pago
const PaymentPopup = ({ reservation, onClose, onPayment }) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");

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
            <label className="block text-sm font-medium text-gray-700">
              Monto a Pagar
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Pago
            </label>
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
