import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBalance } from "../../Redux/Actions/actions";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// ✅ Configurar dayjs con plugins de zona horaria
dayjs.extend(utc);
dayjs.extend(timezone);

// ✅ Importar utilidades mejoradas
import { 
  getColombiaDate, 
  formatDateForDisplay, 
  formatDateForBackend,
  formatMovementDate, // ✅ Importar desde utilidades
  isValidDate 
} from "../../utils/dateUtils";

const Balance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // ✅ Usar función consistente para fecha de Colombia
  const today = getColombiaDate();
  
  console.log("🕒 Fecha de Colombia (consistente):", today);
  console.log("🕒 Fecha con dayjs:", dayjs().tz("America/Bogota").format("YYYY-MM-DD"));
  console.log("🕒 Fecha local navegador:", new Date().toISOString().split('T')[0]);
  console.log("🕒 Offset navegador:", new Date().getTimezoneOffset());

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const {
    balance: backendBalance = 0,
    totalIncome: backendTotalIncome = 0,
    totalOnlineSales = 0,
    totalLocalSales: backendTotalLocalSales = 0,
    totalExpenses = 0,
    income = { online: [], local: [] },
    expenses = [],
    cashierTotals = {},
    loading,
    error,
  } = useSelector((state) => state);

  console.log("📊 Datos del backend:", {
    income,
    expenses,
    cashierTotals,
    totalOnlineSales,
    totalExpenses,
    loading,
    error
  });

  // ✅ State para filtros con fechas de Colombia
  const [filters, setFilters] = useState({
    startDate: today, // ✅ Inicializar con fecha de Colombia
    endDate: today,   // ✅ Inicializar con fecha de Colombia
    paymentMethod: "",
    pointOfSale: "",
    expenseType: "",
    cashier: "",
  });

  // ✅ Función para enviar filtros al backend con formato correcto
  const sendFiltersToBackend = (currentFilters) => {
    const formattedFilters = {
      ...currentFilters,
      // ✅ Formatear fechas específicamente para el backend
      startDate: currentFilters.startDate ? formatDateForBackend(currentFilters.startDate) : undefined,
      endDate: currentFilters.endDate ? formatDateForBackend(currentFilters.endDate) : undefined,
    };

    // ✅ Limpiar filtros vacíos
    Object.keys(formattedFilters).forEach(key => {
      if (formattedFilters[key] === "" || formattedFilters[key] === undefined) {
        delete formattedFilters[key];
      }
    });

    console.log("📤 Enviando filtros al backend:", formattedFilters);
    console.log("📅 Fechas originales:", {
      startDate: currentFilters.startDate,
      endDate: currentFilters.endDate
    });
    console.log("📅 Fechas formateadas:", {
      startDate: formattedFilters.startDate,
      endDate: formattedFilters.endDate
    });

    dispatch(fetchBalance(formattedFilters));
  };

  // ✅ Effect para cargar datos cuando cambian los filtros
  useEffect(() => {
    console.log("🔄 Filtros cambiaron, cargando balance:", filters);
    sendFiltersToBackend(filters);
  }, [dispatch, filters]);

  // ✅ Effect para debugging de movimientos
  useEffect(() => {
    if (income.local && income.local.length > 0) {
      console.log("🔍 Movimientos locales con fechas:", income.local.slice(0, 3).map(m => ({
        id: m.id,
        date: m.date,
        formatted: formatMovementDate(m.date), // ✅ Usar función de utilidades
        type: m.type || 'Venta Local',
        amount: m.amount
      })));
    }
  }, [income.local]);

  // ✅ Función para validar cambios de fecha mejorada
  const handleDateFilterChange = (field, value) => {
    console.log(`📅 Cambiando ${field} a:`, value);

    if (!isValidDate(value)) {
      console.warn(`❌ Fecha inválida para ${field}:`, value);
      alert("Fecha inválida. Por favor selecciona una fecha válida.");
      return;
    }

    // ✅ Validar que no sea fecha futura
    if (value > today) {
      alert("No se pueden seleccionar fechas futuras.");
      return;
    }

    // ✅ Validaciones de rango de fechas
    if (field === 'startDate' && filters.endDate && value > filters.endDate) {
      alert("La fecha de inicio no puede ser mayor que la fecha de fin");
      return;
    }
    
    if (field === 'endDate' && filters.startDate && value < filters.startDate) {
      alert("La fecha de fin no puede ser menor que la fecha de inicio");
      return;
    }

    // ✅ Actualizar filtros
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    console.log(`✅ ${field} actualizada a:`, value);
    console.log("📅 Fecha formateada para mostrar:", formatDateForDisplay(value));
  };

  // ✅ Función para resetear filtros
  const resetFilters = () => {
    const newFilters = {
      startDate: today,
      endDate: today,
      paymentMethod: "",
      pointOfSale: "",
      expenseType: "",
      cashier: "",
    };
    
    console.log("🔄 Reseteando filtros a:", newFilters);
    setFilters(newFilters);
  };

  // ✅ Function to combine and filter all movements
  const getAllMovements = () => {
    const movements = [
      // Map online sales
      ...(income.online || []).map((sale) => ({
        ...sale,
        type: "Venta Online",
        amount: sale.amount || 0,
        date: sale.date,
        paymentMethod: sale.paymentMethod || "Wompi",
        pointOfSale: "Online",
        id: `online-${sale.id_orderDetail}`,
        description: `Pedido #${sale.id_orderDetail}` || "-",
        cashier_document: null,
      })),
      // Map local sales
      ...(income.local || []).map((sale) => ({
        ...sale,
        type: sale.type === "Pago Parcial Reserva" ? "Pago Parcial Reserva" : "Venta Local",
        amount: sale.amount || 0,
        date: sale.date,
        paymentMethod: sale.paymentMethod || "Desconocido",
        pointOfSale: "Local",
        id: `local-${sale.id}`,
        description: sale.buyerName || sale.description || "Desconocido",
        cashier_document: sale.cashierDocument,
      })),
      // Map expenses
      ...(Array.isArray(expenses) ? expenses : []).map((expense) => ({
        ...expense,
        type: `Gasto - ${expense.type}`,
        amount: -(expense.amount || 0),
        date: expense.date,
        paymentMethod: expense.paymentMethods || "N/A",
        pointOfSale: "N/A",
        id: `expense-${expense.id || Math.random().toString(36).substr(2, 9)}`,
        description: expense.description || expense.type || "-",
        cashier_document: null,
      })),
    ];

    // Apply filters
    let filteredMovements = movements;

    if (filters.pointOfSale) {
      filteredMovements = filteredMovements.filter(
        (m) => m.pointOfSale === filters.pointOfSale
      );
    }
    if (filters.paymentMethod) {
      filteredMovements = filteredMovements.filter(
        (m) => m.amount < 0 || m.paymentMethod === filters.paymentMethod
      );
    }
    if (filters.expenseType) {
      filteredMovements = filteredMovements.filter(
        (m) => m.amount >= 0 || m.type === `Gasto - ${filters.expenseType}`
      );
    }
    if (filters.cashier) {
      filteredMovements = filteredMovements.filter(
        (m) => m.type !== "Venta Local" || m.cashier_document === filters.cashier
      );
    }

    // ✅ Sort movements by date usando dayjs para consistencia
    return filteredMovements.sort((a, b) => {
      const dateA = dayjs(a.date).tz("America/Bogota").valueOf();
      const dateB = dayjs(b.date).tz("America/Bogota").valueOf();
      return dateB - dateA;
    });
  };

  // ✅ Function to handle Excel export con fecha corregida
  const handleExportExcel = () => {
    const movementsToExport = getAllMovements();

    const wsData = movementsToExport.map((m) => ({
      Fecha: formatMovementDate(m.date), // ✅ Usar la función de utilidades
      Tipo: m.type,
      Descripción: m.description || "-",
      "Método de Pago": m.paymentMethod || "N/A",
      Monto: m.amount,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);

    // Format the 'Monto' column as Colombian Currency
    ws["!cols"] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
    ];
    Object.keys(ws).forEach((cell) => {
      if (cell.startsWith("E") && cell !== "E1") {
        ws[cell].z = "$ #,##0;[Red]$ -#,##0";
        ws[cell].t = "n";
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balance");
    
    // ✅ Usar fecha de Colombia para el nombre del archivo
    const fileName = `balance_${filters.startDate}_${filters.endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    console.log(`📄 Archivo exportado: ${fileName}`);
  };

  // Calculate income totals per payment method
  const calculateIncomeByMethod = (method) => {
    return (income.local || [])
      .filter(
        (sale) =>
          sale.paymentMethod === method && sale.type !== "Pago Parcial Reserva"
      )
      .reduce((acc, sale) => acc + (sale.amount || 0), 0);
  };

  const ingresosPagosParciales = (income.local || [])
    .filter((sale) => sale.type === "Pago Parcial Reserva")
    .reduce((acc, sale) => acc + (sale.amount || 0), 0);

  const ingresosEfectivo = calculateIncomeByMethod("Efectivo");
  const ingresosTarjeta = calculateIncomeByMethod("Tarjeta");
  const ingresosNequi = calculateIncomeByMethod("Nequi");
  const ingresosBancolombia = calculateIncomeByMethod("Bancolombia");
  const ingresosAddi = calculateIncomeByMethod("Addi");
  const ingresosSistecredito = calculateIncomeByMethod("Sistecredito");

  const displayTotalIncome =
    ingresosEfectivo +
    ingresosTarjeta +
    ingresosNequi +
    ingresosBancolombia +
    totalOnlineSales +
    ingresosPagosParciales;

  const displayBalance = displayTotalIncome - totalExpenses;

  const cashiers = [
    ...new Set(
      (income.local || []).map((sale) => sale.cashierDocument).filter(Boolean)
    ),
  ];

  // ✅ Loading y error states mejorados
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando balance financiero...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar el balance</h3>
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
    );
  }

  const allMovements = getAllMovements();
  const totalPages = Math.ceil(allMovements.length / itemsPerPage);

  const paginatedMovements = allMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
      <h1 className="text-3xl font-bold mb-6 text-center">
        💰 Balance Financiero
      </h1>

      {/* ✅ Información de fecha actual de Colombia mejorada */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <p className="text-sm text-blue-800">
          <strong>📅 Fecha actual de Colombia:</strong> {formatDateForDisplay(today)}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          🕒 Zona horaria: America/Bogota (UTC-5)
        </p>
        <p className="text-xs text-blue-600">
          📊 Rango de filtros: {formatDateForDisplay(filters.startDate)} - {formatDateForDisplay(filters.endDate)}
        </p>
      </div>

      {/* ✅ Filters Section mejorado */}
      <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          🔍 Filtros de Búsqueda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ✅ Input de fecha inicio mejorado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
              max={today} // No permitir fechas futuras
              className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formatDateForDisplay(filters.startDate)}
            </p>
          </div>

          {/* ✅ Input de fecha fin mejorado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Fecha Fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
              min={filters.startDate} // No menor que fecha inicio
              max={today} // No permitir fechas futuras
              className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formatDateForDisplay(filters.endDate)}
            </p>
          </div>

          {/* ✅ Método de pago */}
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
              <option value="Wompi">Wompi (Online)</option>
            </select>
          </div>

          {/* ✅ Punto de venta */}
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

          {/* ✅ Tipo de gasto */}
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

          {/* ✅ Cajero */}
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

        {/* ✅ Botones de acción mejorados */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <button
            onClick={resetFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200 flex items-center"
          >
            🔄 Resetear a Hoy
          </button>
          <button
            onClick={() => sendFiltersToBackend(filters)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 flex items-center"
          >
            🔍 Recargar Datos
          </button>
        </div>
      </div>

      {/* ✅ Income by Payment Method Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          💰 Ingresos por Método (Detalle)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { name: "Efectivo", value: ingresosEfectivo, color: "bg-green-50 border-green-200", icon: "💵" },
            { name: "Tarjeta", value: ingresosTarjeta, color: "bg-green-50 border-green-200", icon: "💳" },
            { name: "Nequi", value: ingresosNequi, color: "bg-green-50 border-green-200", icon: "📱" },
            { name: "Bancolombia", value: ingresosBancolombia, color: "bg-green-50 border-green-200", icon: "🏦" },
            { name: "Addi", value: ingresosAddi, color: "bg-yellow-50 border-yellow-200", icon: "🛒" },
            { name: "Sistecredito", value: ingresosSistecredito, color: "bg-yellow-50 border-yellow-200", icon: "💰" },
            { name: "Venta Online", value: totalOnlineSales, color: "bg-blue-50 border-blue-200", icon: "🌐" },
            { name: "Pagos Parciales", value: ingresosPagosParciales, color: "bg-purple-50 border-purple-200", icon: "📝" },
          ].map((method) => (
            <div
              key={method.name}
              className={`${method.color} p-4 rounded-lg shadow-sm text-center border`}
            >
              <div className="text-2xl mb-2">{method.icon}</div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                {method.name}
              </h3>
              <p className="text-lg font-bold text-gray-900">
                {method.value.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
          ⚠️ Los métodos en amarillo (Addi, Sistecredito) se muestran pero no se incluyen en el cálculo de 'Ingresos Totales' del resumen.
        </p>
      </div>

      {/* ✅ Summary Section mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-100 p-6 rounded-lg shadow-md text-center border-l-4 border-green-500">
          <div className="text-3xl mb-2">💚</div>
          <h3 className="text-lg font-semibold text-green-800">
            Ingresos Totales*
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
          <h3 className="text-lg font-semibold text-blue-800">Balance*</h3>
          <p className={`text-2xl font-bold ${displayBalance >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
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

      {/* ✅ Cashier Totals Section mejorado */}
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

      {/* ✅ Movements Table Section con fechas corregidas */}
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
                  {/* ✅ Celda de fecha corregida usando función de utilidades */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatMovementDate(movement.date)}
                    {/* ✅ Debug temporal - remover después */}
                    <div className="text-xs text-gray-400 mt-1">
                      Raw: {movement.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      movement.amount < 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {movement.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {movement.description || "-"}
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
                  <p>No hay movimientos para mostrar con los filtros seleccionados.</p>
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

        {/* ✅ Controles de paginación mejorados */}
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
                  de{" "}
                  <span className="font-medium">{allMovements.length}</span>{" "}
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
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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

      {/* ✅ Back Button mejorado */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-gray-700 transition duration-200 flex items-center mx-auto"
        >
          ← Volver
        </button>
      </div>

      {/* ✅ Footer con información adicional */}
      <div className="mt-6 text-center text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <p>* Los ingresos totales y balance excluyen Addi y Sistecredito</p>
        <p>📅 Todos los horarios están en zona horaria de Colombia (America/Bogota)</p>
      </div>
    </div>
  );
};

export default Balance;