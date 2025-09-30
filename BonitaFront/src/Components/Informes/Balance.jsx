import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBalance, getServerTime } from "../../Redux/Actions/actions";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import TruncatedText from "./TruncatedText";

// ✅ Configurar dayjs con plugins de zona horaria
dayjs.extend(utc);
dayjs.extend(timezone);

// ✅ Importar utilidades ACTUALIZADAS
import {
  getServerDate,
  formatDateForDisplay,
  formatDateForBackend,
  formatMovementDate,
  isValidDate,
  validateDateNotFuture,
  getDateForInput,
  toColombiaISO
} from "../../utils/dateUtils";

// ✅ Importar ServerTimeSync
import ServerTimeSync from "../ServerTimeSync";

const getSortableTimestamp = (dateString) => {
  if (!dateString) return 0;

  const normalized = toColombiaISO(dateString);
  if (normalized) {
    const parsedNormalized = Date.parse(normalized);
    if (!Number.isNaN(parsedNormalized)) {
      return parsedNormalized;
    }
  }

  const parsedFallback = Date.parse(dateString);
  return Number.isNaN(parsedFallback) ? 0 : parsedFallback;
};

const Balance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const userInfo = useSelector((state) => state.userLogin.userInfo);
  
  // ✅ VERIFICAR SI ES CAJERO (quien tiene la restricción)
  const isCajero = userInfo?.role === 'Cajero';

useEffect(() => {
    console.log('🔍 [Balance] UserInfo cambió:', {
      userInfo,
      role: userInfo?.role,
      isLoggedIn: !!userInfo,
      isCajero: userInfo?.role === 'Cajero'
    });
  }, [userInfo]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ ACTUALIZAR: Incluir serverTime en los selectores
  const {
    balance: backendBalance = 0,
    totalIncome: backendTotalIncome = 0,
    totalOnlineSales = 0,
    totalLocalSales: backendTotalLocalSales = 0,
    totalExpenses = 0,
    income = { online: [], local: [] },
    expenses = { data: [] },
    cashierTotals = {},
    paymentMethodBreakdown = {},
    loading,
    error,
    debug,
    dateRange,
    serverTime // ✅ NUEVO: Agregar serverTime
  } = useSelector((state) => state);

  console.log("📊 Datos completos del Redux (con serverTime):", {
    backendBalance,
    backendTotalIncome,
    totalOnlineSales,
    backendTotalLocalSales,
    totalExpenses,
    income,
    expenses,
    cashierTotals,
    paymentMethodBreakdown,
    loading,
    error,
    debug,
    dateRange,
    serverTime // ✅ NUEVO LOG
  });

  // ✅ USAR FECHA DEL SERVIDOR en lugar de fecha local
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: "",
    pointOfSale: "",
    expenseType: "",
    cashier: "",
  });

  // ✅ NUEVO: Inicializar fechas con fecha del servidor
  useEffect(() => {
    if (serverTime?.current?.date && !filters.startDate) {
      const serverDate = serverTime.current.date;
      console.log('🕒 [Balance] Inicializando con fecha del servidor:', serverDate);
      
      setFilters(prev => ({
        ...prev,
        startDate: serverDate,
        endDate: serverDate
      }));
    }
  }, [serverTime?.current?.date]);

  // ✅ NUEVO: Cargar servidor time al inicio
  useEffect(() => {
    console.log('🕒 [Balance] Sincronizando con servidor...');
    dispatch(getServerTime());
  }, [dispatch]);

  // ✅ Función para enviar filtros al backend con formato correcto
  const sendFiltersToBackend = (currentFilters) => {
    const formattedFilters = {
      ...currentFilters,
      startDate: currentFilters.startDate
        ? formatDateForBackend(currentFilters.startDate)
        : undefined,
      endDate: currentFilters.endDate
        ? formatDateForBackend(currentFilters.endDate)
        : undefined,
    };

    Object.keys(formattedFilters).forEach((key) => {
      if (formattedFilters[key] === "" || formattedFilters[key] === undefined) {
        delete formattedFilters[key];
      }
    });

    console.log("📤 [Balance] Enviando filtros al backend:", formattedFilters);
    dispatch(fetchBalance(formattedFilters));
  };

  // ✅ Effect para debug de estructura de datos
  useEffect(() => {
    if (income.local && income.local.length > 0) {
      console.log("🔍 DEBUG: Estructura de ventas locales:", income.local.slice(0, 2));
    }
    
    if (paymentMethodBreakdown && Object.keys(paymentMethodBreakdown).length > 0) {
      console.log("🔍 DEBUG: Payment Method Breakdown:", paymentMethodBreakdown);
    }
  }, [income.local, paymentMethodBreakdown]);

  // ✅ Effect para cargar datos cuando cambian los filtros (solo después de tener fecha del servidor)
  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      console.log('📊 [Balance] Cargando datos con filtros:', filters);
      sendFiltersToBackend(filters);
    }
  }, [filters.startDate, filters.endDate]); // Solo reacciona a cambios de fecha

  // ✅ FUNCIÓN MEJORADA: Validar cambios de fecha usando servidor
  const handleDateFilterChange = (field, value) => {
    // ✅ BLOQUEAR cambios de fecha SOLO para CAJEROS
    if (isCajero) {
      alert("⚠️ Como cajero, solo puedes ver el informe de la fecha actual.");
      return;
    }

    console.log(`📅 [Balance] Cambiando ${field} a:`, value);

    if (!isValidDate(value)) {
      console.warn(`❌ Fecha inválida para ${field}:`, value);
      alert("Fecha inválida. Por favor selecciona una fecha válida.");
      return;
    }

    // ✅ USAR VALIDACIÓN DEL SERVIDOR
    const validation = validateDateNotFuture(value, serverTime, field === 'startDate' ? 'Fecha de inicio' : 'Fecha de fin');
    
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    if (field === "startDate" && filters.endDate && value > filters.endDate) {
      alert("La fecha de inicio no puede ser mayor que la fecha de fin");
      return;
    }

    if (field === "endDate" && filters.startDate && value < filters.startDate) {
      alert("La fecha de fin no puede ser menor que la fecha de inicio");
      return;
    }

    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));

    console.log(`✅ [Balance] ${field} actualizada a:`, value);
  };

  // ✅ FUNCIÓN MEJORADA: Resetear filtros usando fecha del servidor
  const resetFilters = () => {
    const serverDate = getServerDate(serverTime);
    
    const newFilters = {
      startDate: serverDate,
      endDate: serverDate,
      paymentMethod: "",
      pointOfSale: "",
      expenseType: "",
      cashier: "",
    };

    console.log("🔄 [Balance] Reseteando filtros a fecha del servidor:", newFilters);
    setFilters(newFilters);
  };

  // ✅ Function to combine and filter all movements
 // ✅ FUNCIÓN CORREGIDA: getAllMovements para incluir gastos
// ✅ FUNCIÓN CORREGIDA: getAllMovements para incluir gastos
// ✅ CORRECCIÓN: Asegurar que expenses.data sea siempre un array
const getAllMovements = () => {
  let movements = [];

  // ✅ AGREGAR INGRESOS ONLINE
  if (income?.online) {
    const onlineMovements = income.online.map(sale => ({
      id: `online-${sale.id_orderDetail}`,
      date: sale.date,
      type: 'Venta Online',
      description: `Venta Online - OrderDetail: ${sale.id_orderDetail}`,
      paymentMethod: 'Wompi',
      amount: sale.amount,
      category: 'Ingreso',
      sortKey: getSortableTimestamp(sale.date)
    }));
    movements.push(...onlineMovements);
  }

  // ✅ AGREGAR INGRESOS LOCALES (excluyendo Addi/Sistecredito para el balance)
  if (income?.local) {
    const localMovements = income.local
      .filter(payment => !['Addi', 'Sistecredito', 'Crédito'].includes(payment.paymentMethod))
      .map(payment => ({
        id: payment.id,
        date: payment.date,
        type: payment.type || 'Venta Local',
        description: payment.description || `${payment.buyerName || 'Cliente'} - ${payment.type || 'Venta'}`,
        paymentMethod: payment.paymentMethod,
        amount: payment.amount,
        category: 'Ingreso',
        cashierDocument: payment.cashierDocument,
        buyerName: payment.buyerName,
        originalReceiptId: payment.originalReceiptId,
        isMainPayment: payment.isMainPayment,
        sortKey: getSortableTimestamp(payment.date)
      }));
    movements.push(...localMovements);
  }

  // ✅ CORRECCIÓN: Manejar estructura inconsistente de expenses
  let expensesData = [];
  
  // Verificar si expenses.data es un array o un objeto con data anidada
  if (Array.isArray(expenses?.data)) {
    expensesData = expenses.data;
  } else if (Array.isArray(expenses?.data?.data)) {
    expensesData = expenses.data.data;
  } else if (expenses?.data && typeof expenses.data === 'object') {
    // Si expenses.data es un objeto pero no tiene data anidada, intentar extraer un array
    expensesData = [];
    console.warn("⚠️ expenses.data no es un array válido:", expenses.data);
  }

  // ✅ AGREGAR GASTOS DEL BACKEND
  if (expensesData.length > 0) {
    const expenseMovements = expensesData.map(expense => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      type: expense.type || 'Gasto',
      description: expense.description || 'Sin descripción',
      paymentMethod: expense.paymentMethods || 'No especificado',
      amount: -Math.abs(expense.amount), // ✅ NEGATIVO para gastos
      category: 'Gasto',
      destinatario: expense.destinatario,
      originalExpenseId: expense.id,
      sortKey: getSortableTimestamp(expense.date)
    }));
    movements.push(...expenseMovements);
  }

  // ✅ ORDENAR POR FECHA (más recientes primero) respetando Colombia
  movements.sort((a, b) => {
    const bKey = typeof b.sortKey === "number" ? b.sortKey : getSortableTimestamp(b.date);
    const aKey = typeof a.sortKey === "number" ? a.sortKey : getSortableTimestamp(a.date);
    return bKey - aKey;
  });

  console.log("🔄 getAllMovements() - Resumen:", {
    totalMovimientos: movements.length,
    ingresos: movements.filter(m => m.amount >= 0).length,
    gastos: movements.filter(m => m.amount < 0).length,
    gastosDelBackend: expensesData.length,
    expensesStructure: {
      isArray: Array.isArray(expenses?.data),
      hasNestedData: Array.isArray(expenses?.data?.data),
      type: typeof expenses?.data
    }
  });

  return movements;
};

  // ✅ Function to handle Excel export
  // ✅ FUNCIÓN MEJORADA: Exportar Excel con gastos incluidos
// ✅ FUNCIÓN MEJORADA: Exportar Excel con gastos incluidos
// ✅ FUNCIÓN CORREGIDA: handleExportExcel completa
// ✅ CORRECCIÓN COMPLETA: handleExportExcel
const handleExportExcel = () => {
  console.log("🔍 DEBUGGING EXCEL EXPORT - INICIO");
  
  // ✅ LOG DEL ESTADO COMPLETO ANTES DE PROCESAR
  console.log("📊 Estado completo del balance:", { income, expenses, paymentMethodBreakdown });
  console.log("📊 Estructura de expenses:", expenses);
  
  // ✅ DETECTAR ESTRUCTURA DE EXPENSES
  let expensesData = [];
  if (Array.isArray(expenses?.data)) {
    expensesData = expenses.data;
  } else if (Array.isArray(expenses?.data?.data)) {
    expensesData = expenses.data.data;
  }
  
  console.log("📊 Datos de gastos procesados:", expensesData);
  console.log("📊 Longitud de gastos:", expensesData.length);
  
  const movementsToExport = getAllMovements();
  
  console.log("📋 Movimientos exportados:", movementsToExport);
  console.log("📋 Total movimientos:", movementsToExport.length);

  // ✅ SEPARAR MOVIMIENTOS POR TIPO
  const ingresos = movementsToExport.filter(m => m.amount >= 0);
  const gastos = movementsToExport.filter(m => m.amount < 0); // ✅ COMPLETAR LÍNEA 287
  
  console.log("💰 Ingresos encontrados:", ingresos.length);
  console.log("💸 Gastos encontrados:", gastos.length);
  console.log("💸 Detalle de gastos:", gastos);
  
  // ✅ LOG ESPECÍFICO DE GASTOS DEL BACKEND
  if (expensesData.length > 0) {
    console.log("🔍 GASTOS DIRECTOS DEL BACKEND:");
    console.log("Total gastos del backend:", expensesData.length);
    expensesData.forEach((expense, index) => {
      console.log(`Gasto ${index + 1}:`, {
        id: expense.id,
        type: expense.type,
        amount: expense.amount,
        date: expense.date,
        description: expense.description,
        paymentMethod: expense.paymentMethods,
        destinatario: expense.destinatario
      });
    });
  } else {
    console.warn("⚠️ No se encontraron gastos en expenses.data");
  }

  // ✅ CREAR GASTOS PARA EXCEL
  let gastosParaExcel = [];
  
  if (gastos.length === 0 && expensesData.length > 0) {
    console.log("🔧 Usando gastos directamente del backend");
    gastosParaExcel = expensesData.map(expense => ({
      date: expense.date,
      type: expense.type || 'Gasto',
      description: expense.description || 'Sin descripción',
      paymentMethod: expense.paymentMethods || 'No especificado',
      amount: Math.abs(expense.amount),
      destinatario: expense.destinatario || 'No especificado'
    }));
  } else {
    console.log("🔧 Usando gastos de movimientos filtrados");
    gastosParaExcel = gastos.map(g => ({
      date: g.date,
      type: g.type,
      description: g.description || 'Sin descripción',
      paymentMethod: g.paymentMethod || 'No especificado',
      amount: Math.abs(g.amount),
      destinatario: g.destinatario || 'No especificado'
    }));
  }
  
  console.log("📊 Gastos para Excel final:", gastosParaExcel);

  // ✅ CREAR HOJA DE RESUMEN
  const resumenData = [
    ["📊 RESUMEN FINANCIERO", "", "", "", ""],
    ["Período:", formatDateForDisplay(filters.startDate), "a", formatDateForDisplay(filters.endDate), ""],
    ["", "", "", "", ""],
    ["💰 TOTALES", "", "", "", ""],
    ["Total Ingresos:", "", "", "", displayTotalIncome],
    ["Total Gastos:", "", "", "", Math.abs(totalExpenses)],
    ["Balance Final:", "", "", "", displayBalance],
    ["", "", "", "", ""],
    ["💳 INGRESOS POR MÉTODO DE PAGO", "", "", "", ""],
    ["Efectivo:", "", "", "", ingresosEfectivo],
    ["Tarjeta:", "", "", "", ingresosTarjeta],
    ["Nequi:", "", "", "", ingresosNequi],
    ["Bancolombia:", "", "", "", ingresosBancolombia],
    ["Crédito:", "", "", "", ingresosCredito],
    ["GiftCard:", "", "", "", ingresosGiftCard],
    ["Otro:", "", "", "", ingresosOtro],
    ["Wompi (Online):", "", "", "", totalOnlineSales],
    ["Pagos Iniciales:", "", "", "", ingresosPagosIniciales],
    ["Pagos Parciales:", "", "", "", ingresosPagosParciales],
    ["", "", "", "", ""],
    ["📋 INFORMACIÓN ADICIONAL", "", "", "", ""],
    ["Addi (Crédito):", "", "", "", ingresosAddi],
    ["Sistecredito (Crédito):", "", "", "", ingresosSistecredito],
    ["Nota:", "Los créditos no se incluyen en el balance", "", "", ""],
  ];

  // ✅ CREAR HOJA DE INGRESOS
  const ingresosData = [
    ["📅 Fecha", "📝 Tipo", "📄 Descripción", "💳 Método de Pago", "💰 Monto"],
    ...ingresos.map((m) => [
      formatMovementDate(m.date),
      m.type,
      m.description || "-",
      m.paymentMethod || "N/A",
      m.amount,
    ]),
    ["", "", "", "TOTAL INGRESOS:", ingresos.reduce((sum, m) => sum + m.amount, 0)]
  ];

  // ✅ CREAR HOJA DE GASTOS
  const gastosData = [
    ["📅 Fecha", "📝 Tipo", "📄 Descripción", "💳 Método de Pago", "💰 Monto", "👤 Destinatario"],
    ...gastosParaExcel.map((gasto) => [
      formatMovementDate(gasto.date),
      gasto.type || "Gasto",
      gasto.description || "-",
      gasto.paymentMethod || "N/A",
      gasto.amount,
      gasto.destinatario || "No especificado"
    ]),
    ["", "", "", "", "TOTAL GASTOS:", gastosParaExcel.reduce((sum, g) => sum + g.amount, 0)]
  ];

  // ✅ CREAR HOJA DE TODOS LOS MOVIMIENTOS
  const todosMovimientosData = [
    ["📅 Fecha", "📝 Tipo", "📄 Descripción", "💳 Método de Pago", "💰 Monto", "🔄 Categoría"],
    ...movementsToExport.map((m) => [
      formatMovementDate(m.date),
      m.type,
      m.description || "-",
      m.paymentMethod || "N/A",
      m.amount,
      m.amount >= 0 ? "INGRESO" : "GASTO"
    ]),
    ...(gastos.length === 0 && gastosParaExcel.length > 0 ? gastosParaExcel.map((gasto) => [
      formatMovementDate(gasto.date),
      gasto.type,
      gasto.description || "-",
      gasto.paymentMethod || "N/A",
      -gasto.amount,
      "GASTO"
    ]) : []),
    ["", "", "", "", "", ""],
    ["", "", "", "TOTAL INGRESOS:", ingresos.reduce((sum, m) => sum + m.amount, 0), ""],
    ["", "", "", "TOTAL GASTOS:", gastosParaExcel.reduce((sum, g) => sum + g.amount, 0), ""],
    ["", "", "", "BALANCE FINAL:", displayBalance, ""]
  ];

  // ✅ CREAR LIBRO DE TRABAJO
  const wb = XLSX.utils.book_new();

  // ✅ AGREGAR HOJAS
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  wsResumen["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 5 }, { wch: 15 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, "📊 Resumen");

  const wsIngresos = XLSX.utils.aoa_to_sheet(ingresosData);
  wsIngresos["!cols"] = [{ wch: 12 }, { wch: 20 }, { wch: 35 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsIngresos, "💰 Ingresos");

  const wsGastos = XLSX.utils.aoa_to_sheet(gastosData);
  wsGastos["!cols"] = [{ wch: 12 }, { wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsGastos, "💸 Gastos");

  const wsTodos = XLSX.utils.aoa_to_sheet(todosMovimientosData);
  wsTodos["!cols"] = [{ wch: 12 }, { wch: 20 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsTodos, "📋 Todos los Movimientos");

  // ✅ EXPORTAR
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  const fileName = `balance_completo_${filters.startDate}_${filters.endDate}_${timestamp}.xlsx`;

  XLSX.writeFile(wb, fileName);

  console.log(`📄 Archivo exportado: ${fileName}`);
  alert(`✅ Excel exportado exitosamente!\n\n📊 Resumen:\n• ${ingresos.length} ingresos\n• ${gastosParaExcel.length} gastos\n• ${movementsToExport.length} movimientos totales\n\n📁 Archivo: ${fileName}`);
};

  // ✅ REEMPLAZAR: Usar datos del backend en lugar de calcular localmente
  const ingresosEfectivo = paymentMethodBreakdown.efectivo || 0;
  const ingresosTarjeta = paymentMethodBreakdown.tarjeta || 0;
  const ingresosNequi = paymentMethodBreakdown.nequi || 0;
  const ingresosBancolombia = paymentMethodBreakdown.bancolombia || 0;
  const ingresosAddi = paymentMethodBreakdown.addi || 0;
  const ingresosSistecredito = paymentMethodBreakdown.sistecredito || 0;
  const ingresosCredito = paymentMethodBreakdown.credito || 0;
  const ingresosGiftCard = paymentMethodBreakdown.giftCard || 0;
  const ingresosOtro = paymentMethodBreakdown.otro || 0;
  const ingresosPagosParciales = paymentMethodBreakdown.pagosParciales || 0;
  const ingresosPagosIniciales = paymentMethodBreakdown.pagosIniciales || 0;

  // ✅ USAR: Totales del backend
  const displayTotalIncome = backendTotalIncome;
  const displayBalance = backendBalance;

  // ✅ AGREGAR: Log de debug para verificar datos
  console.log("🔍 DEBUG: Valores de métodos de pago:", {
    ingresosEfectivo,
    ingresosTarjeta,
    ingresosNequi,
    ingresosBancolombia,
    ingresosCredito,
    ingresosGiftCard,
    ingresosOtro,
    totalOnlineSales,
    ingresosAddi,
    ingresosSistecredito,
    ingresosPagosIniciales,
    ingresosPagosParciales,
    paymentMethodBreakdown
  });

  // ✅ Cajeros dinámicos
  const cashiers = [
    ...new Set(
      (income.local || []).map((sale) => sale.cashierDocument).filter(Boolean)
    ),
  ];

  // ✅ ESTADOS DE CARGA MEJORADOS con ServerTimeSync
  if (loading || serverTime?.loading) {
    return (
      <ServerTimeSync showDebug={false}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {serverTime?.loading ? 'Sincronizando con servidor...' : 'Cargando balance financiero...'}
            </p>
          </div>
        </div>
      </ServerTimeSync>
    );
  }

  if (error) {
    return (
      <ServerTimeSync showDebug={false}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Error al cargar el balance
              </h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => sendFiltersToBackend(filters)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
              >
                🔄 Reintentar
              </button>
            </div>
          </div>
        </div>
      </ServerTimeSync>
    );
  }

  const allMovements = getAllMovements();
  const totalPages = Math.ceil(allMovements.length / itemsPerPage);

  const paginatedMovements = allMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ServerTimeSync showDebug={false}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
        <h1 className="text-3xl font-bold mb-6 text-center">
          💰 Balance Financiero (Sincronizado)
          {isCajero && (
            <span className="block text-sm text-orange-600 mt-2">
              👤 Vista de Cajero - Solo fecha actual
            </span>
          )}
        </h1>

        {isCajero && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
            <p className="text-sm text-orange-800">
              <strong>🔒 Restricción de Cajero:</strong> Como cajero, solo puedes ver el informe de la fecha actual. 
              Los filtros de fecha están bloqueados para tu rol.
            </p>
          </div>
        )}

        {/* ✅ NUEVO: Información de debug si está disponible */}
        {debug && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-700 font-medium">
                🔍 Información de Debug (Click para expandir)
              </summary>
              <div className="mt-2 text-xs text-gray-600">
                <p><strong>Consultas ejecutadas:</strong></p>
                <ul className="ml-4 list-disc">
                  <li>Ventas online: {debug.queriesExecuted?.onlineSales || 0}</li>
                  <li>Ventas locales: {debug.queriesExecuted?.localSales || 0}</li>
                  <li>Ventas locales formateadas: {debug.queriesExecuted?.formattedLocalSales || 0}</li>
                  <li>Pagos parciales: {debug.queriesExecuted?.partialPayments || 0}</li>
                  <li>Pagos iniciales: {debug.queriesExecuted?.initialReservationPayments || 0}</li>
                  <li>Gastos: {debug.queriesExecuted?.expenses || 0}</li>
                </ul>
                <p className="mt-2"><strong>Pagos combinados detectados:</strong> {debug.combinedPaymentsCount || 0}</p>
              </div>
            </details>
          </div>
        )}

        {/* ✅ INFORMACIÓN DE FECHA ACTUAL DEL SERVIDOR */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <p className="text-sm text-blue-800">
            <strong>📅 Fecha actual del servidor (Colombia):</strong>{" "}
            {formatDateForDisplay(getServerDate(serverTime))}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            🕒 Zona horaria: America/Bogota (UTC-5)
          </p>
          <p className="text-xs text-blue-600">
            📊 Rango de filtros: {formatDateForDisplay(filters.startDate)} -{" "}
            {formatDateForDisplay(filters.endDate)}
          </p>
          {dateRange && (
            <p className="text-xs text-blue-600">
              🔄 Último rango procesado: {dateRange.startDate} - {dateRange.endDate}
            </p>
          )}
        </div>

        {/* ✅ SECCIÓN DE FILTROS ACTUALIZADA */}
        <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            🔍 Filtros de Búsqueda
            {isCajero && (
              <span className="ml-2 text-sm text-orange-600">(Fechas bloqueadas)</span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Fecha Inicio
                {isCajero && <span className="text-orange-600 ml-1">🔒</span>}
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleDateFilterChange("startDate", e.target.value)}
                max={getDateForInput(serverTime)}
                disabled={isCajero} // ✅ DESHABILITAR solo para cajeros
                className={`border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isCajero ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                }`}
                title={isCajero ? "Los cajeros solo pueden ver la fecha actual" : ""}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatDateForDisplay(filters.startDate)}
                {isCajero && <span className="text-orange-600 ml-1">(Solo fecha actual)</span>}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Fecha Fin
                {isCajero && <span className="text-orange-600 ml-1">🔒</span>}
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleDateFilterChange("endDate", e.target.value)}
                min={filters.startDate}
                max={getDateForInput(serverTime)}
                disabled={isCajero} // ✅ DESHABILITAR solo para cajeros
                className={`border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isCajero ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                }`}
                title={isCajero ? "Los cajeros solo pueden ver la fecha actual" : ""}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatDateForDisplay(filters.endDate)}
                {isCajero && <span className="text-orange-600 ml-1">(Solo fecha actual)</span>}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💳 Método de Pago
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) =>
                  setFilters({ ...filters, paymentMethod: e.target.value })
                }
                className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los Métodos (Ingresos)</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Nequi">Nequi</option>
                <option value="Bancolombia">Bancolombia</option>
                <option value="Addi">Addi</option>
                <option value="Sistecredito">Sistecredito</option>
                <option value="Crédito">Crédito</option>
                <option value="GiftCard">GiftCard</option>
                <option value="Otro">Otro</option>
                <option value="Wompi">Wompi (Online)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🏪 Punto de Venta
              </label>
              <select
                value={filters.pointOfSale}
                onChange={(e) =>
                  setFilters({ ...filters, pointOfSale: e.target.value })
                }
                className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los Puntos de Venta</option>
                <option value="Local">Local</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💸 Tipo de Gasto
              </label>
              <select
                value={filters.expenseType}
                onChange={(e) =>
                  setFilters({ ...filters, expenseType: e.target.value })
                }
                className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los Tipos de Gasto</option>
                <option value="Nomina Colaboradores">Nómina Colaboradores</option>
                <option value="Servicios">Servicios</option>
                <option value="Arriendo">Arriendo</option>
                <option value="Proveedores">Proveedores</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                👤 Cajero
              </label>
              <select
                value={filters.cashier}
                onChange={(e) =>
                  setFilters({ ...filters, cashier: e.target.value })
                }
                className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los Cajeros (Ventas Locales)</option>
                {cashiers.map((cashier) => (
                  <option key={cashier} value={cashier}>
                    {cashier}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={resetFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200 flex items-center"
            >
              🔄 Resetear a Hoy (Servidor)
            </button>
            <button
              onClick={() => sendFiltersToBackend(filters)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 flex items-center"
            >
              🔍 Recargar Datos
            </button>
            <button
              onClick={() => dispatch(getServerTime())}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition duration-200 flex items-center"
              title="Sincronizar con servidor"
            >
              🕒 Sync Servidor
            </button>
          </div>
        </div>

        {/* ✅ CONTINÚA CON EL RESTO DEL COMPONENTE... */}
        {/* Tarjetas de ingresos por método de pago */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            💰 Ingresos por Método de Pago (Desde Backend)
          </h2>
          
          {/* ✅ Mensaje informativo sobre Addi y Sistecredito */}
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 mb-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Nota:</strong> Addi y Sistecredito se muestran aquí para información, pero no aparecen en el listado de movimientos porque son ventas a crédito que no ingresan dinero el mismo día.
            </p>
          </div>

          {/* ✅ Mostrar mensaje si no hay datos */}
          {Object.keys(paymentMethodBreakdown).length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 mb-4">
              <p className="text-yellow-800">
                <strong>⚠️ Sin datos:</strong> El backend no está enviando información de métodos de pago. 
                Revisa la respuesta de la API.
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              {
                name: "Efectivo",
                value: ingresosEfectivo,
                color: "bg-green-50 border-green-200",
                icon: "💵",
                includeInTotal: true,
                type: "immediate",
              },
              {
                name: "Tarjeta",
                value: ingresosTarjeta,
                color: "bg-green-50 border-green-200",
                icon: "💳",
                includeInTotal: true,
                type: "immediate",
              },
              {
                name: "Nequi",
                value: ingresosNequi,
                color: "bg-green-50 border-green-200",
                icon: "📱",
                includeInTotal: true,
                type: "immediate",
              },
              {
                name: "Bancolombia",
                value: ingresosBancolombia,
                color: "bg-green-50 border-green-200",
                icon: "🏦",
                includeInTotal: true,
                type: "immediate",
              },
              {
                name: "Crédito",
                value: ingresosCredito,
                color: "bg-blue-50 border-blue-200",
                icon: "💰",
                includeInTotal: true,
                type: "immediate",
              },
              {
                name: "GiftCard",
                value: ingresosGiftCard,
                color: "bg-purple-50 border-purple-200",
                icon: "🎁",
                includeInTotal: true,
                type: "immediate",
              },
              {
                name: "Otro",
                value: ingresosOtro,
                color: "bg-gray-50 border-gray-200",
                icon: "💼",
                includeInTotal: true,
                type: "immediate",
              },
              {
                name: "Wompi",
                value: totalOnlineSales,
                color: "bg-blue-50 border-blue-200",
                icon: "🌐",
                includeInTotal: true,
                type: "immediate",
              },
              {
                name: "Addi",
                value: ingresosAddi,
                color: "bg-orange-50 border-orange-200",
                icon: "🛒",
                includeInTotal: false,
                type: "credit",
              },
              {
                name: "Sistecredito",
                value: ingresosSistecredito,
                color: "bg-orange-50 border-orange-200",
                icon: "💳",
                includeInTotal: false,
                type: "credit",
              },
              {
                name: "Pagos Iniciales",
                value: ingresosPagosIniciales,
                color: "bg-purple-50 border-purple-200",
                icon: "🆕",
                includeInTotal: true,
                type: "immediate",
              },
              {
                name: "Pagos Parciales",
                value: ingresosPagosParciales,
                color: "bg-purple-50 border-purple-200",
                icon: "📝",
                includeInTotal: true,
                type: "immediate",
              },
            ]
            .map((method) => (
              <div
                key={method.name}
                className={`${method.color} p-4 rounded-lg shadow-sm text-center border transition-all duration-200 hover:shadow-md ${
                  method.value === 0 ? 'opacity-60' : ''
                }`}
              >
                <div className="text-2xl mb-2">{method.icon}</div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  {method.name}
                </h3>
                <p className={`text-lg font-bold ${
                  method.value === 0 ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  {method.value.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </p>
                {/* ✅ Indicadores específicos para créditos */}
                {method.type === "credit" && method.value > 0 && (
                  <p className="text-xs text-orange-700 mt-1">
                    📋 Crédito (no en listado)
                  </p>
                )}
                {!method.includeInTotal && method.value > 0 && method.type === "credit" && (
                  <p className="text-xs text-orange-600 mt-1">
                    No incluido en balance
                  </p>
                )}
                {/* ✅ Indicador si está en $0 */}
                {method.value === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sin movimientos
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* ✅ Información explicativa actualizada */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <strong>💡 Datos del Backend:</strong> Los valores se calculan en el servidor e incluyen separación automática de pagos combinados.
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
              <p className="text-sm text-orange-800">
                <strong>📋 Ventas a Crédito:</strong> Addi y Sistecredito no aparecen en el listado porque el dinero no ingresa el mismo día.
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
              <p className="text-sm text-green-800">
                <strong>✅ Total Calculado:</strong> {displayTotalIncome.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ ACTUALIZAR: Summary usando datos del backend */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-100 p-6 rounded-lg shadow-md text-center border-l-4 border-green-500">
            <div className="text-3xl mb-2">💚</div>
            <h3 className="text-lg font-semibold text-green-800">
              Ingresos Totales (Backend)*
            </h3>
            <p className="text-2xl font-bold text-green-900">
              {displayTotalIncome.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
            </p>
          </div>
          <div className="bg-red-100 p-6 rounded-lg shadow-md text-center border-l-4 border-red-500">
            <div className="text-3xl mb-2">💸</div>
            <h3 className="text-lg font-semibold text-red-800">Gastos Totales</h3>
            <p className="text-2xl font-bold text-red-900">
              {totalExpenses.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
            </p>
          </div>
          <div className="bg-blue-100 p-6 rounded-lg shadow-md text-center border-l-4 border-blue-500">
            <div className="text-3xl mb-2">⚖️</div>
            <h3 className="text-lg font-semibold text-blue-800">Balance (Backend)*</h3>
            <p
              className={`text-2xl font-bold ${
                displayBalance >= 0 ? "text-blue-900" : "text-red-900"
              }`}
            >
              {displayBalance.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
            </p>
          </div>
          <button
            onClick={handleExportExcel}
            className="bg-indigo-600 text-white p-6 rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 flex flex-col items-center justify-center border-l-4 border-indigo-500"
          >
            <div className="text-3xl mb-2">📊</div>
            <span className="font-semibold">Exportar Excel</span>
          </button>
        </div>

        {/* ✅ Cashier Totals Section */}
        {Object.keys(cashierTotals).length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              👤 Ventas por Cajero (Local)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(cashierTotals)
                .filter(
                  ([cashier]) => !filters.cashier || cashier === filters.cashier
                )
                .map(([cashier, total]) => (
                  <div
                    key={cashier}
                    className="bg-purple-50 p-4 rounded-lg shadow-sm text-center border border-purple-200"
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <h3 className="text-md font-semibold text-purple-800">
                      {cashier}
                    </h3>
                    <p className="text-xl font-bold text-purple-900">
                      {total.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ✅ Movements Table Section */}
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold mb-3 p-4 bg-gray-100 rounded-t-lg flex items-center">
            📋 Detalle de Movimientos
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({allMovements.length} registros)
            </span>
          </h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  📅 Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  📝 Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  📄 Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  💳 Método de Pago
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  💰 Monto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedMovements.length > 0 ? (
                paginatedMovements.map((movement) => (
                  <tr
                    key={movement.id}
                    className={`transition-colors duration-200 ${
                      movement.amount < 0
                        ? "hover:bg-red-50"
                        : "hover:bg-green-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatMovementDate(movement.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          movement.amount < 0
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <TruncatedText text={movement.description} maxLength={80} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {movement.paymentMethod || "N/A"}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                        movement.amount < 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {movement.amount.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>
                      No hay movimientos para mostrar con los filtros
                      seleccionados.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      Resetear filtros
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ✅ Controles de paginación */}
          {allMovements.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente →
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, allMovements.length)}
                    </span>{" "}
                    de <span className="font-medium">{allMovements.length}</span>{" "}
                    resultados
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      title="Primera página"
                    >
                      {"<<"}
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      title="Página anterior"
                    >
                      {"<"}
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {currentPage} / {totalPages || 1}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      title="Página siguiente"
                    >
                      {">"}
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      title="Última página"
                    >
                      {">>"}
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-gray-700 transition duration-200 flex items-center mx-auto"
          >
            ← Volver
          </button>
        </div>

        {/* ✅ Footer actualizado */}
        <div className="mt-6 text-center text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p>* Los ingresos totales y balance excluyen Addi y Sistecredito</p>
          <p>💻 Los cálculos se procesan en el backend con separación automática de pagos combinados</p>
          <p>
            📅 Todos los horarios están sincronizados con la zona horaria de Colombia
            (America/Bogota) usando fecha del servidor
          </p>
        </div>
      </div>
    </ServerTimeSync>
  );
};

export default Balance;