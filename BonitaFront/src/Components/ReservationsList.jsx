import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllReservations,
  applyPayment,
  createReceipt,
  deleteReservation,
  updateReservation,
  fetchLatestReceipt,
  fetchOrdersByIdOrder,
  getServerTime // ✅ AGREGAR getServerTime
} from "../Redux/Actions/actions";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';

import {
  getServerDate,
  formatDateForDisplay,
  formatMovementDate,
  getDateForInput,
  isValidDate,
  validateDateNotFuture
} from "../utils/dateUtils";

import ServerTimeSync from "./ServerTimeSync";

const ReservationList = () => {
  const dispatch = useDispatch();
  const reservations = useSelector((state) => state.reservation.list) || [];
  const loading = useSelector((state) => state.reservation.loading);
  const error = useSelector((state) => state.reservation.error);
  const latestReceipt = useSelector((state) => state.receiptNumber);
  
  // ✅ AGREGAR: Selector para serverTime
  const serverTime = useSelector((state) => state.serverTime);
  
  // ✅ CORREGIR: Agregar verificación segura para orderById
  const orderDetails = useSelector((state) => state.orderById?.orderDetail || null);

  // ✅ Estados para filtros CON FECHAS DEL SERVIDOR
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    usuario: '',
    documento: '',
    soloVencidas: false,
    ocultarCompletadas: true // ✅ NUEVO: Ocultar reservas completadas por defecto
  });

  const [currentOrderDetail, setCurrentOrderDetail] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reservationsPerPage] = useState(7);
  const { userInfo } = useSelector((state) => state.userLogin);


  

const paginate = (pageNumber) => setCurrentPage(pageNumber);

// ✅ Calcular deuda pendiente (MOVER ARRIBA para que esté disponible)
const calculatePendingDebt = (totalAmount, paidAmount) => {
  const total = Number(totalAmount) || 0;
  const paid = Number(paidAmount) || 0;
  return Math.max(0, total - paid);
};

// ✅ APLICAR FILTROS: Ocultar completadas O con saldo 0 (CON useMemo)
const filteredReservations = useMemo(() => {
  return (reservations || []).filter(r => {
    // Si el filtro está activo, ocultar completadas y saldo 0
    if (filters.ocultarCompletadas) {
      // Usar pendingDebt que viene del backend, o calcularlo si no existe
      const saldo = r.pendingDebt !== undefined 
        ? r.pendingDebt 
        : calculatePendingDebt(r.OrderDetail?.amount || 0, r.totalPaid || 0);
      
      return r.status !== 'Completada' && saldo > 0;
    }
    // Si el filtro está desactivado, mostrar todas
    return true;
  });
}, [reservations, filters.ocultarCompletadas]); // ✅ Recalcular cuando cambien reservations o el filtro

const indexOfLastReservation = currentPage * reservationsPerPage;
const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
const currentReservations = filteredReservations.slice(
  indexOfFirstReservation,
  indexOfLastReservation
);
// ✅ INICIALIZAR fecha del servidor
  useEffect(() => {
    dispatch(getServerTime());
  }, [dispatch]);

  // ✅ INICIALIZAR filtros con fecha del servidor (inicio año - hoy)
  useEffect(() => {
    if (serverTime?.current?.date && !filters.fechaInicio) {
      const serverDate = serverTime.current.date;
      const currentYear = new Date(serverDate).getFullYear();
      const firstDayOfYear = `${currentYear}-01-01`;
      
      console.log('🕒 [ReservationsList] Inicializando fechas:');
      console.log('  - Fecha inicio (primer día del año):', firstDayOfYear);
      console.log('  - Fecha fin (hoy):', serverDate);
      
      setFilters(prev => ({
        ...prev,
        fechaInicio: firstDayOfYear,
        fechaFin: serverDate
      }));
    }
  }, [serverTime?.current?.date]);

  // ✅ Función para aplicar filtros CON VALIDACIÓN DE FECHA
  const handleFilterChange = (filterName, value) => {
    // ✅ VALIDAR fechas usando servidor
    if (filterName === 'fechaInicio' || filterName === 'fechaFin') {
      if (value && !isValidDate(value)) {
        Swal.fire({
          icon: "error",
          title: "Fecha inválida",
          text: "Por favor selecciona una fecha válida",
        });
        return;
      }

      // Validar que no sea fecha futura
      if (value) {
        const validation = validateDateNotFuture(value, serverTime, 
          filterName === 'fechaInicio' ? 'Fecha de inicio' : 'Fecha de fin');
        
        if (!validation.valid) {
          Swal.fire({
            icon: "warning",
            title: "Fecha futura",
            text: validation.message,
          });
          return;
        }
      }

      // Validar orden de fechas
      if (filterName === 'fechaInicio' && filters.fechaFin && value > filters.fechaFin) {
        Swal.fire({
          icon: "warning",
          title: "Fechas inválidas",
          text: "La fecha de inicio no puede ser mayor que la fecha de fin",
        });
        return;
      }

      if (filterName === 'fechaFin' && filters.fechaInicio && value < filters.fechaInicio) {
        Swal.fire({
          icon: "warning",
          title: "Fechas inválidas", 
          text: "La fecha de fin no puede ser menor que la fecha de inicio",
        });
        return;
      }
    }

    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // ✅ Buscar con filtros ACTUALIZADO
  const searchWithFilters = () => {
    const filterObj = {};
    if (filters.fechaInicio) filterObj.fechaInicio = filters.fechaInicio;
    if (filters.fechaFin) filterObj.fechaFin = filters.fechaFin;
    if (filters.usuario) filterObj.usuario = filters.usuario;
    if (filters.documento) filterObj.documento = filters.documento;
    if (filters.soloVencidas) filterObj.soloVencidas = 'true';

    console.log('🔍 [ReservationsList] Buscando con filtros:', filterObj);
    dispatch(getAllReservations(filterObj));
    setCurrentPage(1);
  };

  // ✅ Limpiar filtros CON FECHA DEL SERVIDOR
  const clearFilters = () => {
    const serverDate = getServerDate(serverTime);
    const currentYear = new Date(serverDate).getFullYear();
    const firstDayOfYear = `${currentYear}-01-01`;
    
    setFilters({
      fechaInicio: firstDayOfYear,
      fechaFin: serverDate,
      usuario: '',
      documento: '',
      soloVencidas: false,
      ocultarCompletadas: true // ✅ Mantener ocultar completadas al limpiar
    });
    
    console.log('🧹 [ReservationsList] Filtros limpiados, fecha del servidor:', serverDate);
    dispatch(getAllReservations());
    setCurrentPage(1);
  };

  // ✅ CARGAR DATOS INICIALES
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔵 [ReservationsList] Cargando reservas...');
        await dispatch(getAllReservations());
        await dispatch(fetchLatestReceipt());
      } catch (error) {
        console.error('❌ [ReservationsList] Error cargando datos:', error);
      }
    };

    loadData();
  }, [dispatch]);

  // ✅ FUNCIONES DE FECHA MEJORADAS
  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'Sin fecha';
    return formatMovementDate(dueDate);
  };
  
  const formatCreationDate = (createdAt) => {
    if (!createdAt) return 'Fecha inválida';
    return formatMovementDate(createdAt);
  };
  
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    
    const today = new Date();
    const serverToday = getServerDate(serverTime);
    const todayDate = new Date(serverToday + 'T00:00:00');
    const dueDateObj = new Date(dueDate);
    
    return dueDateObj < todayDate;
  };

  // ✅ NUEVA: Función para exportar a Excel
  const exportToExcel = () => {
    try {
      // Filtrar reservas según filtros activos
      let dataToExport = reservations || [];
      
      // Aplicar filtro de ocultar completadas
      if (filters.ocultarCompletadas) {
        dataToExport = dataToExport.filter(r => r.status !== 'Completada');
      }

      // Preparar datos para Excel
      const excelData = dataToExport.map(reservation => {
        const pendingDebt = calculatePendingDebt(
          reservation.OrderDetail?.amount || 0,
          reservation.totalPaid || 0
        );

        return {
          'Fecha Creación': formatCreationDate(reservation.createdAt),
          'Cliente': reservation.OrderDetail?.User 
            ? `${reservation.OrderDetail.User.first_name || ''} ${reservation.OrderDetail.User.last_name || ''}`.trim()
            : 'No disponible',
          'Documento': reservation.n_document || 'N/A',
          'Email': reservation.OrderDetail?.User?.email || 'N/A',
          'Teléfono': reservation.OrderDetail?.User?.phone || 'N/A',
          'Fecha Vencimiento': formatDueDate(reservation.dueDate),
          'Estado': reservation.status || 'Pendiente',
          'Pago Inicial': `$${(reservation.partialPayment || 0).toLocaleString('es-CO')}`,
          'Total Pagado': `$${(reservation.totalPaid || 0).toLocaleString('es-CO')}`,
          'Monto Total': `$${(reservation.OrderDetail?.amount || 0).toLocaleString('es-CO')}`,
          'Deuda Pendiente': `$${pendingDebt.toLocaleString('es-CO')}`,
          'ID Reserva': reservation.id_reservation,
          'ID Orden': reservation.id_orderDetail
        };
      });

      // Crear worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 15 }, // Fecha Creación
        { wch: 25 }, // Cliente
        { wch: 15 }, // Documento
        { wch: 30 }, // Email
        { wch: 15 }, // Teléfono
        { wch: 15 }, // Fecha Vencimiento
        { wch: 12 }, // Estado
        { wch: 15 }, // Pago Inicial
        { wch: 15 }, // Total Pagado
        { wch: 15 }, // Monto Total
        { wch: 15 }, // Deuda Pendiente
        { wch: 38 }, // ID Reserva
        { wch: 38 }  // ID Orden
      ];
      ws['!cols'] = colWidths;

      // Crear workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reservas');

      // Generar nombre de archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      const fileName = `Reservas_${fecha}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, fileName);

      Swal.fire({
        icon: 'success',
        title: 'Excel generado',
        text: `Se exportaron ${excelData.length} reservas`,
        timer: 2000
      });
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el archivo Excel'
      });
    }
  };

  // ✅ APLICAR PAGO con fecha del servidor
  const handlePayment = async (id_reservation, amount, paymentMethod) => {
  try {
    console.log('🔵 [ReservationsList] Aplicando pago:', { id_reservation, amount, paymentMethod });
    
    await dispatch(applyPayment(id_reservation, amount, paymentMethod));
    
    const updatedReservation = reservations.find(
      (res) => res.id_reservation === id_reservation
    );
    
    if (!updatedReservation || !updatedReservation.OrderDetail) {
      throw new Error("No se encontró la reserva o los detalles de la orden");
    }

    const buyerFirstName = updatedReservation.OrderDetail?.User?.first_name || "";
    const buyerLastName = updatedReservation.OrderDetail?.User?.last_name || "";
    const buyerName = `${buyerFirstName} ${buyerLastName}`.trim() || "Cliente no identificado";
    const receiptNumber = latestReceipt ? latestReceipt + 1 : 1001;

    // ✅ USAR FECHA DEL SERVIDOR
    const receiptData = {
      receiptNumber,
      id_orderDetail: updatedReservation.id_orderDetail,
      total_amount: amount,
      amount,
      buyer_name: buyerName,
      buyer_email: updatedReservation.OrderDetail?.User?.email || "sin-email@ejemplo.com",
      buyer_phone: updatedReservation.OrderDetail?.User?.phone || "Sin teléfono",
      payMethod: paymentMethod,
      payMethod2: null,
      amount2: null,
      date: getServerDate(serverTime), // ✅ FECHA DEL SERVIDOR
      cashier_document: userInfo?.n_document || "ADMIN",
      tipo_transaccion: "Pago Parcial Reserva"
    };

    // ❌ NO LLAMES A createReceipt PARA PAGOS PARCIALES
    // await dispatch(createReceipt(receiptData));

    const saldoPendiente = calculatePendingDebt(
      updatedReservation.OrderDetail.amount,
      (updatedReservation.totalPaid || 0) + amount
    );

    Swal.fire({
      title: "Pago Aplicado",
      text: `Pago aplicado correctamente para ${buyerName}. Puedes descargar el comprobante.`,
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

    // ✅ Verificar si está completamente pagada
    if ((updatedReservation.totalPaid || 0) + amount >= updatedReservation.OrderDetail.amount) {
      await dispatch(updateReservation(id_reservation, "Completada"));
    }

    await dispatch(getAllReservations());
    handleClosePaymentPopup();
  } catch (error) {
    console.error('❌ [ReservationsList] Error aplicando pago:', error);
    Swal.fire({
      title: "Error",
      text: error.message || "No se pudo aplicar el pago. Por favor, inténtalo de nuevo.",
      icon: "error",
    });
  }
};

  // ✅ Eliminar reserva con mejor manejo
 const handleDelete = async (id_reservation) => {
    try {
      console.log('🔵 [ReservationsList] Eliminando reserva:', id_reservation);
      await dispatch(deleteReservation(id_reservation));
      await dispatch(getAllReservations());
    } catch (error) {
      console.error('❌ [ReservationsList] Error eliminando reserva:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar la reserva. Por favor, inténtalo de nuevo.",
        icon: "error",
      });
    }
  };

  const handleOpenPaymentPopup = (reservation) => {
    console.log('🔵 [ReservationsList] Abriendo popup para:', reservation);
    if (!reservation || !reservation.OrderDetail) {
      console.error('❌ [ReservationsList] Reserva sin OrderDetail:', reservation);
      Swal.fire({
        title: "Error",
        text: "No se encontraron detalles de la orden para esta reserva.",
        icon: "error",
      });
      return;
    }
    setSelectedReservation(reservation);
    setIsPaymentPopupOpen(true);
  };

  const handleClosePaymentPopup = () => {
    setSelectedReservation(null);
    setIsPaymentPopupOpen(false);
  };

  // ✅ Generar PDF con verificaciones mejoradas
  const generatePDF = (receiptData) => {
    try {
      console.log('🔵 [ReservationsList] Generando PDF:', receiptData);
      
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

      const doc = new jsPDF({
        unit: "pt",
        format: [226.77, 839.28],
      });

      doc.setFontSize(18);
      doc.text("Bonita Boutique", doc.internal.pageSize.width / 2, 30, {
        align: "center",
      });

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

      doc.text(
        `RECIBO # ${receiptNumber}`,
        doc.internal.pageSize.width / 2,
        currentY,
        { align: "center" }
      );
      currentY += 20;

      doc.text(`Fecha: ${date}`, doc.internal.pageSize.width / 2, currentY, {
        align: "center",
      });
      currentY += 20;

      doc.text(
        `Tipo: Pago Parcial Reserva`,
        doc.internal.pageSize.width / 2,
        currentY,
        { align: "center" }
      );

      currentY += 20;
      doc.text(
        "***************************",
        doc.internal.pageSize.width / 2,
        currentY,
        { align: "center" }
      );
      currentY += 20;

      doc.setFontSize(10);
      doc.text(`Cliente: ${buyer_name}`, 20, currentY);
      currentY += 20;

      doc.text(`Email: ${buyer_email}`, 20, currentY);
      currentY += 20;

      doc.text(`Teléfono: ${buyer_phone || "N/A"}`, 20, currentY);
      currentY += 20;

      doc.text(
        "***************************",
        doc.internal.pageSize.width / 2,
        currentY,
        { align: "center" }
      );
      currentY += 20;

      doc.setFontSize(11);
      doc.text(`Pago Parcial: $${total_amount?.toLocaleString("es-CO")}`, 20, currentY);
      currentY += 20;

      doc.setFontSize(12);
      doc.text(`Saldo Pendiente: $${saldoPendiente?.toLocaleString("es-CO")}`, 20, currentY);
      currentY += 20;

      doc.setFontSize(10);
      doc.text(`Método de Pago: ${payMethod}`, 20, currentY);
      currentY += 20;

      doc.text(`Orden: ${id_orderDetail}`, 20, currentY);
      currentY += 30;

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

      doc.setFontSize(12);
      doc.text(
        "Gracias por elegirnos!",
        doc.internal.pageSize.width / 2,
        currentY,
        { align: "center" }
      );

      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    } catch (error) {
      console.error('❌ [ReservationsList] Error generando PDF:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo generar el PDF. Por favor, inténtalo de nuevo.",
        icon: "error",
      });
    }
  };

  // ✅ Estados de carga y error mejorados
 if (loading || serverTime?.loading) {
    return (
      <ServerTimeSync showDebug={false}>
        <div className="container mx-auto p-4 mt-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {serverTime?.loading ? 'Sincronizando con servidor...' : 'Cargando reservas...'}
            </p>
          </div>
        </div>
      </ServerTimeSync>
    );
  }

  if (error) {
    return (
      <ServerTimeSync showDebug={false}>
        <div className="container mx-auto p-4 mt-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              ❌ Error al cargar reservas
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => dispatch(getAllReservations())}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </ServerTimeSync>
    );
  }

  return (
    <ServerTimeSync showDebug={false}>
      <div className="container mx-auto p-4 mt-12">
        {/* ✅ AGREGAR información del servidor */}
        <div className="mb-4 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <p className="text-xs text-blue-600">
            📅 <strong>Fecha actual del servidor:</strong> {formatDateForDisplay(getServerDate(serverTime))} | 
            📊 Reservas cargadas: {reservations?.length || 0} | 
            🔗 OrderDetails: {orderDetails ? 'Disponible' : 'No disponible'} |
            🎫 Último recibo: {latestReceipt || 'N/A'}
          </p>
        </div>

      {/* Panel de filtros */}
       <h1 className="text-2xl font-bold mb-6">Gestión de Reservas</h1>

        {/* Panel de filtros CON VALIDACIÓN MEJORADA */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">🔍 Filtros de Búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.fechaInicio}
                onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                max={getDateForInput(serverTime)} // ✅ USAR máximo del servidor
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {filters.fechaInicio ? formatDateForDisplay(filters.fechaInicio) : 'Sin fecha seleccionada'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Fecha Fin
              </label>
              <input
                type="date"
                value={filters.fechaFin}
                onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                min={filters.fechaInicio} // ✅ VALIDAR que sea después del inicio
                max={getDateForInput(serverTime)} // ✅ USAR máximo del servidor
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {filters.fechaFin ? formatDateForDisplay(filters.fechaFin) : 'Sin fecha seleccionada'}
              </p>
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              👤 Nombre Cliente
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre o apellido"
              value={filters.usuario}
              onChange={(e) => handleFilterChange('usuario', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📄 Documento
            </label>
            <input
              type="text"
              placeholder="Buscar por documento"
              value={filters.documento}
              onChange={(e) => handleFilterChange('documento', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.soloVencidas}
                onChange={(e) => handleFilterChange('soloVencidas', e.target.checked)}
                className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">⚠️ Solo Vencidas</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.ocultarCompletadas}
                onChange={(e) => handleFilterChange('ocultarCompletadas', e.target.checked)}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">✅ Ocultar Completadas</span>
            </label>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={searchWithFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            🔍 Buscar
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            🗑️ Limpiar Filtros
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            title="Exportar resultados a Excel"
          >
            � Exportar Excel
          </button>
        </div>
          {(filters.fechaInicio || filters.fechaFin || filters.usuario || filters.documento || filters.soloVencidas || filters.ocultarCompletadas) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Filtros activos:</strong>
                {filters.fechaInicio && ` Desde: ${formatDateForDisplay(filters.fechaInicio)}`}
                {filters.fechaFin && ` Hasta: ${formatDateForDisplay(filters.fechaFin)}`}
                {filters.usuario && ` Cliente: "${filters.usuario}"`}
                {filters.documento && ` Documento: "${filters.documento}"`}
                {filters.soloVencidas && ` Solo Vencidas`}
                {filters.ocultarCompletadas && ` Ocultar Completadas`}
              </p>
            </div>
          )}
        </div>

      {/* Tabla de reservas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-lg rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">Fecha Creación</th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">Cliente</th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">Documento</th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">Vencimiento</th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">Estado</th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">Parcial</th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">Monto Total</th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">Deuda Pendiente</th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentReservations &&
              currentReservations.map((reservation) => {
                // ✅ Verificación segura de datos
                if (!reservation || !reservation.OrderDetail) {
                  console.warn('⚠️ [ReservationsList] Reserva sin OrderDetail:', reservation);
                  return null;
                }

                const pendingDebt = calculatePendingDebt(
                  reservation.OrderDetail?.amount || 0,
                  reservation.totalPaid || 0
                );

                // Formatear fechas
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
                  } catch {
                    return 'Fecha inválida';
                  }
                };
                
                const formatCreationDate = (createdAt) => {
                  try {
                    const date = new Date(createdAt);
                    return date.toLocaleDateString('es-CO', {
                      timeZone: 'America/Bogota',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    });
                  } catch {
                    return 'Fecha inválida';
                  }
                };
                
                const isOverdue = () => {
                  if (!reservation.dueDate) return false;
                  const today = new Date();
                  const colombiaToday = new Date(today.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
                  const dueDate = new Date(reservation.dueDate);
                  return dueDate < colombiaToday;
                };
                
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
                    <td className="py-3 px-4 border-b">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {formatCreationDate(reservation.createdAt)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(reservation.createdAt).toLocaleTimeString('es-CO', {
                            timeZone: 'America/Bogota',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
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
                    <td className="py-3 px-4 border-b">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {reservation.OrderDetail?.User?.n_document || reservation.n_document || 'N/A'}
                      </span>
                    </td>
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
                        ${(reservation.totalPaid || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <span className="font-semibold">
                        ${(reservation.OrderDetail?.amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <span className={`font-bold ${
                        pendingDebt > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ${pendingDebt.toLocaleString()}
                      </span>
                      {pendingDebt <= 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          ✅ Pagado completo
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex flex-col space-y-1">
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
                        <button
                          onClick={() => {
                            const currentPendingDebt = calculatePendingDebt(
                              reservation.OrderDetail?.amount || 0,
                              reservation.totalPaid || 0
                            );
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

      {/* Mensaje cuando no hay reservas */}
      {(!currentReservations || currentReservations.length === 0) && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {Object.values(filters).some(filter => filter !== '' && filter !== false)
              ? 'No se encontraron reservas con los filtros aplicados'
              : 'No hay reservas'}
          </h3>
          <p className="text-gray-500">
            {Object.values(filters).some(filter => filter !== '' && filter !== false)
              ? 'Intenta modificar los filtros de búsqueda'
              : 'No se encontraron reservas para mostrar en este momento.'}
          </p>
        </div>
      )}

      {/* Paginación */}
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
            length: Math.ceil(filteredReservations.length / reservationsPerPage),
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
              currentPage < Math.ceil(filteredReservations.length / reservationsPerPage) &&
              paginate(currentPage + 1)
            }
            disabled={currentPage === Math.ceil(filteredReservations.length / reservationsPerPage)}
            className={`px-3 py-2 rounded ${
              currentPage === Math.ceil(filteredReservations.length / reservationsPerPage)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Estadísticas rápidas */}
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
          <h4 className="text-sm font-medium text-gray-600">Vencidas con Deuda</h4>
          <p className="text-2xl font-bold text-red-600">
            {reservations?.filter(r => {
              if (!r.dueDate) return false;
              const today = new Date();
              const colombiaToday = new Date(today.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
              const dueDate = new Date(r.dueDate);
              const pendingDebt = calculatePendingDebt(r.OrderDetail?.amount || 0, r.totalPaid || 0);
              return dueDate < colombiaToday && pendingDebt > 0 && (!r.status || r.status === 'Pendiente');
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
    </ServerTimeSync>
  );
};

// ✅ Componente para el Popup de Pago mejorado
const PaymentPopup = ({ reservation, onClose, onPayment }) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");

  const calculatePendingDebt = (totalAmount, paidAmount) => {
    const total = Number(totalAmount) || 0;
    const paid = Number(paidAmount) || 0;
    return Math.max(0, total - paid);
  };

  const pendingDebt = calculatePendingDebt(
    reservation.OrderDetail?.amount || 0,
    reservation.totalPaid || 0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount) || 0;

    if (amount <= 0) {
      Swal.fire({
        title: "Error",
        text: "El monto debe ser mayor a 0",
        icon: "error",
      });
      return;
    }

    if (amount > pendingDebt) {
      Swal.fire({
        title: "Error",
        text: `El monto no puede ser mayor al saldo pendiente ($${pendingDebt.toLocaleString()})`,
        icon: "error",
      });
      return;
    }

    onPayment(reservation.id_reservation, amount, paymentMethod);
  };

  // ✅ Verificar que la reserva tenga OrderDetail
  if (!reservation || !reservation.OrderDetail) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-4 text-red-600">❌ Error</h2>
          <p className="mb-4">No se encontraron detalles de la orden para esta reserva.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">💳 Aplicar Pago</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Información de la Reserva</h3>
          <p className="text-sm text-gray-600">
            <strong>Cliente:</strong> {reservation.OrderDetail?.User?.first_name || 'Sin nombre'} {reservation.OrderDetail?.User?.last_name || ''}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Monto Total:</strong> ${(reservation.OrderDetail?.amount || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Ya Pagado:</strong> ${(reservation.totalPaid || 0).toLocaleString()}
          </p>
          <p className="text-sm font-semibold text-red-600">
            <strong>Saldo Pendiente:</strong> ${pendingDebt.toLocaleString()}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Monto a Pagar
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              max={pendingDebt}
              min="0"
              step="0.01"
              placeholder={`Máximo: $${pendingDebt.toLocaleString()}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💳 Método de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="Efectivo">💵 Efectivo</option>
              <option value="Tarjeta">💳 Tarjeta de Débito/Crédito</option>
              <option value="Addi">📱 Addi</option>
              <option value="Sistecredito">🏦 Sistecredito</option>
              <option value="Bancolombia">🏛️ Bancolombia</option>
              <option value="Transferencia">🔄 Transferencia</option>
              <option value="Otro">❓ Otro</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ✅ Aplicar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationList;