import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBalance } from "../../Redux/Actions/actions";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
// ✅ Importar utilidades de fecha para Colombia
import { getColombiaDate, formatDateForDisplay, isValidDate } from "../../utils/dateUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

const Balance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // ✅ Usar función consistente para fecha de Colombia
  const today = getColombiaDate();
  
  console.log("Fecha de Colombia (consistente):", today);
  console.log("Fecha con dayjs:", dayjs().tz("America/Bogota").format("YYYY-MM-DD"));
  console.log("Fecha local navegador:", new Date());
  console.log("Offset navegador:", new Date().getTimezoneOffset());

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
  } = useSelector((state) => state);

  console.log("Datos del backend:", {
    income,
    expenses,
    cashierTotals,
    totalOnlineSales,
    totalExpenses,
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

  // ✅ Remover useEffect de carga de fecha externa - usar fecha local consistente
  useEffect(() => {
    console.log("Cargando balance con filtros:", filters);
    const formattedFilters = {
      ...filters,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    };
    console.log("Filtros enviados al backend:", formattedFilters);
    dispatch(fetchBalance(formattedFilters));
  }, [dispatch, filters]);

  // ✅ Función para validar cambios de fecha
  const handleDateFilterChange = (field, value) => {
    if (!isValidDate(value)) {
      console.warn(`Fecha inválida para ${field}:`, value);
      return;
    }

    // Validar que startDate no sea mayor que endDate
    if (field === 'startDate' && filters.endDate && value > filters.endDate) {
      alert("La fecha de inicio no puede ser mayor que la fecha de fin");
      return;
    }
    
    if (field === 'endDate' && filters.startDate && value < filters.startDate) {
      alert("La fecha de fin no puede ser menor que la fecha de inicio");
      return;
    }

    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    console.log(`${field} actualizada a:`, value);
  };

  // --- Function to combine and filter all movements ---
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
        description: sale.buyerName || "Desconocido",
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
    return filteredMovements.sort((a, b) => 
      dayjs(b.date).tz("America/Bogota").valueOf() - dayjs(a.date).tz("America/Bogota").valueOf()
    );
  };

  // ✅ Function to handle Excel export con fecha de Colombia
  const handleExportExcel = () => {
    const movementsToExport = getAllMovements();

    const wsData = movementsToExport.map((m) => ({
      Fecha: dayjs(m.date).tz("America/Bogota").format("DD/MM/YYYY HH:mm"),
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
    const fileName = `balance_${today}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    console.log(`Archivo exportado: ${fileName}`);
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

  if (loading) return <div className="text-center mt-40">Cargando...</div>;

  const allMovements = getAllMovements();
  const totalPages = Math.ceil(allMovements.length / itemsPerPage);

  const paginatedMovements = allMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Balance Financiero
      </h1>

      {/* ✅ Información de fecha actual de Colombia */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Fecha actual de Colombia:</strong> {formatDateForDisplay(today)}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Filtros predeterminados configurados para hoy
        </p>
      </div>

      {/* ✅ Filters Section mejorado */}
      <div className="mb-6 p-4 border rounded shadow-sm bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ✅ Input de fecha inicio mejorado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
              max={today} // No permitir fechas futuras
              className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formatDateForDisplay(filters.startDate)}
            </p>
          </div>

          {/* ✅ Input de fecha fin mejorado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
              min={filters.startDate} // No menor que fecha inicio
              max={today} // No permitir fechas futuras
              className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formatDateForDisplay(filters.endDate)}
            </p>
          </div>

          <select
            value={filters.paymentMethod}
            onChange={(e) =>
              setFilters({ ...filters, paymentMethod: e.target.value })
            }
            className="border rounded p-2"
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
          
          <select
            value={filters.pointOfSale}
            onChange={(e) =>
              setFilters({ ...filters, pointOfSale: e.target.value })
            }
            className="border rounded p-2"
          >
            <option value="">Todos los Puntos de Venta</option>
            <option value="Local">Local</option>
            <option value="Online">Online</option>
          </select>
          
          <select
            value={filters.expenseType}
            onChange={(e) =>
              setFilters({ ...filters, expenseType: e.target.value })
            }
            className="border rounded p-2"
          >
            <option value="">Todos los Tipos de Gasto</option>
            <option value="Nomina Colaboradores">Nómina Colaboradores</option>
            <option value="Servicios">Servicios</option>
            <option value="Arriendo">Arriendo</option>
            <option value="Proveedores">Proveedores</option>
            <option value="Otros">Otros</option>
          </select>
          
          <select
            value={filters.cashier}
            onChange={(e) =>
              setFilters({ ...filters, cashier: e.target.value })
            }
            className="border rounded p-2"
          >
            <option value="">Todos los Cajeros (Ventas Locales)</option>
            {cashiers.map((cashier) => (
              <option key={cashier} value={cashier}>
                {cashier}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Botón para resetear filtros a hoy */}
        <div className="mt-4">
          <button
            onClick={() => setFilters({
              startDate: today,
              endDate: today,
              paymentMethod: "",
              pointOfSale: "",
              expenseType: "",
              cashier: "",
            })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
          >
            Resetear a Hoy
          </button>
        </div>
      </div>

      {/* Income by Payment Method Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">
          Ingresos por Método (Detalle)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { name: "Efectivo", value: ingresosEfectivo, color: "bg-green-50" },
            { name: "Tarjeta", value: ingresosTarjeta, color: "bg-green-50" },
            { name: "Nequi", value: ingresosNequi, color: "bg-green-50" },
            {
              name: "Bancolombia",
              value: ingresosBancolombia,
              color: "bg-green-50",
            },
            { name: "Addi", value: ingresosAddi, color: "bg-yellow-50" },
            {
              name: "Sistecredito",
              value: ingresosSistecredito,
              color: "bg-yellow-50",
            },
            {
              name: "Venta Online",
              value: totalOnlineSales,
              color: "bg-blue-50",
            },
            {
              name: "Pagos Parciales Reserva",
              value: ingresosPagosParciales,
              color: "bg-purple-50",
            },
          ].map((method) => (
            <div
              key={method.name}
              className={`${method.color} p-4 rounded shadow-sm text-center`}
            >
              <h3 className="text-md font-semibold text-gray-700">
                {method.name}
              </h3>
              <p className="text-xl font-bold text-gray-900">
                {method.value.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * Los métodos en amarillo (Addi, Sistecredito) se muestran pero no se
          incluyen en el cálculo de 'Ingresos Totales' del resumen.
        </p>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded shadow-md text-center">
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
        <div className="bg-red-100 p-4 rounded shadow-md text-center">
          <h3 className="text-lg font-semibold text-red-800">Gastos Totales</h3>
          <p className="text-2xl font-bold text-red-900">
            {totalExpenses.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            })}
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow-md text-center">
          <h3 className="text-lg font-semibold text-blue-800">Balance*</h3>
          <p className="text-2xl font-bold text-blue-900">
            {displayBalance.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            })}
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          className="bg-indigo-600 text-white p-4 rounded shadow-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Exportar Excel
        </button>
      </div>

      {/* Cashier Totals Section */}
      {Object.keys(cashierTotals).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">
            Ventas por Cajero (Local)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(cashierTotals)
              .filter(
                ([cashier]) => !filters.cashier || cashier === filters.cashier
              )
              .map(([cashier, total]) => (
                <div
                  key={cashier}
                  className="bg-purple-50 p-4 rounded shadow-sm text-center"
                >
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

      {/* Movements Table Section */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-3 p-4 bg-gray-100 rounded-t-lg">
          Detalle de Movimientos
        </h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método de Pago
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedMovements.length > 0 ? (
              paginatedMovements.map((movement) => (
                <tr
                  key={movement.id}
                  className={
                    movement.amount < 0
                      ? "hover:bg-red-50"
                      : "hover:bg-green-50"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {dayjs(movement.date)
                      .tz("America/Bogota")
                      .format("DD/MM/YYYY HH:mm")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {movement.type}
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
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No hay movimientos para mostrar con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Controles de paginación mejorados */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
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
                >
                  {"<<"}
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
                >
                  {">"}
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  {">>"}
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white py-2 px-5 rounded shadow-md hover:bg-gray-700 transition duration-200"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default Balance;