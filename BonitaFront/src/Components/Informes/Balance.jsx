import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBalance } from "../../Redux/Actions/actions";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
import axios from "axios";



const Balance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const today = dayjs().tz("America/Bogota").format("YYYY-MM-DD");
console.log("Fecha local navegador:", new Date());
console.log("Fecha Colombia calculada con dayjs:", today);
console.log("Offset navegador:", new Date().getTimezoneOffset());

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const {
    balance: backendBalance = 0, // Renamed backend value
    totalIncome: backendTotalIncome = 0, // Renamed backend value
    totalOnlineSales = 0,
    totalLocalSales: backendTotalLocalSales = 0, // Renamed backend value
    totalExpenses = 0,
    income = { online: [], local: [] }, // Default to empty arrays
    expenses = [], // Default to empty array
    cashierTotals = {}, // Default to empty object
    loading,
  } = useSelector((state) => state);
  console.log("Datos del backend:", {
  income,
  expenses,
  cashierTotals,
  totalOnlineSales,
  totalExpenses,
});

  // State for filters
  const [loadingFecha, setLoadingFecha] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    paymentMethod: "",
    pointOfSale: "",
    expenseType: "",
    cashier: "",
  });
   
 useEffect(() => {
    if (!filters.startDate && !filters.endDate) {
      axios.get("/hora/now-colombia") // Ajusta la ruta si tu backend la expone diferente
        .then(res => {
          setFilters(f => ({
            ...f,
            startDate: res.data.today,
            endDate: res.data.today
          }));
        })
        .finally(() => setLoadingFecha(false));
    } else {
      setLoadingFecha(false);
    }
  }, []);

useEffect(() => {
  if (loadingFecha) return; // Espera a tener la fecha de Colombia

  const formattedFilters = {
    ...filters,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };
  console.log("Filtros enviados al backend:", formattedFilters);
  dispatch(fetchBalance(formattedFilters));
}, [dispatch, filters, loadingFecha]);
 

  // --- Function to combine and filter all movements ---
  const getAllMovements = () => {
    // Combine sales and expenses into a single array
    const movements = [
      // Map online sales
      ...(income.online || []).map((sale) => ({
        ...sale, // Spread original sale properties
        type: "Venta Online",
        amount: sale.amount || 0, // Ensure amount is a number
        date: sale.date,
        paymentMethod: sale.paymentMethod || "Wompi", // Default payment method if needed
        pointOfSale: "Online",
        id: `online-${sale.id_orderDetail}`, // Create a unique ID
        description: `Pedido #${sale.id_orderDetail}` || "-", // Use order ID for description
        cashier_document: null, // No cashier for online sales
      })),
      // Map local sales
      ...(income.local || []).map((sale) => ({
        ...sale, // Spread original sale properties
        type:
          sale.type === "Pago Parcial Reserva"
            ? "Pago Parcial Reserva"
            : "Venta Local",
        amount: sale.amount || 0,
        date: sale.date,
        paymentMethod: sale.paymentMethod || "Desconocido",
        pointOfSale: "Local",
        id: `local-${sale.id}`,
        description: sale.buyerName || "Desconocido",
        cashier_document: sale.cashierDocument, // Keep cashier document
      })),
      // Map expenses
      ...(Array.isArray(expenses) ? expenses : []).map((expense) => ({
        ...expense, // Spread original expense properties
        type: `Gasto - ${expense.type}`,
        amount: -(expense.amount || 0), // Expenses are negative, ensure amount is number
        date: expense.date,
        paymentMethod: expense.paymentMethods || "N/A", // Payment method for expenses
        pointOfSale: "N/A", // Point of sale might not apply to expenses
        id: `expense-${expense.id || Math.random().toString(36).substr(2, 9)}`, // Ensure unique ID
        description: expense.description || expense.type || "-", // Use expense description or type
        cashier_document: null, // No specific cashier for expenses usually
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
      // Filter incomes only, as expenses might not have the same payment methods
      filteredMovements = filteredMovements.filter(
        (m) => m.amount < 0 || m.paymentMethod === filters.paymentMethod
      );
    }
    if (filters.expenseType) {
      // Filter only expenses by their specific type
      filteredMovements = filteredMovements.filter(
        (m) => m.amount >= 0 || m.type === `Gasto - ${filters.expenseType}`
      );
    }
    if (filters.cashier) {
      // Filter local sales by cashier
      filteredMovements = filteredMovements.filter(
        (m) =>
          m.type !== "Venta Local" || m.cashier_document === filters.cashier
      );
    }

    // Sort movements by date, most recent first
    return filteredMovements.sort((a, b) => 
  dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
);
  };

  

  // --- Function to handle Excel export ---
  const handleExportExcel = () => {
    const movementsToExport = getAllMovements(); // Get filtered movements

    // Map data for the Excel sheet, ensuring correct description
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
    ]; // Adjust column widths
    Object.keys(ws).forEach((cell) => {
      if (cell.startsWith("E") && cell !== "E1") {
        // Target 'Monto' column, skip header
        ws[cell].z = "$ #,##0;[Red]$ -#,##0";
        ws[cell].t = "n"; // Set cell type to number
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balance");
    XLSX.writeFile(
      wb,
      `balance_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // --- Calculate income totals per payment method (for individual cards) ---
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

  // --- Calculate Total Income to DISPLAY (excluding Addi and Sistecredito) ---
  const displayTotalIncome =
    ingresosEfectivo +
    ingresosTarjeta +
    ingresosNequi +
    ingresosBancolombia +
    totalOnlineSales + // Sum only desired local methods + online sales
    ingresosPagosParciales;
  // --- Calculate Balance to DISPLAY ---
  const displayBalance = displayTotalIncome - totalExpenses;

  // --- Get unique cashiers for the filter dropdown ---
  const cashiers = [
    ...new Set(
      (income.local || []).map((sale) => sale.cashierDocument).filter(Boolean) // Remove null/undefined cashier documents
    ),
  ];

  // --- Render loading state ---
  if (loading) return <div className="text-center mt-40">Cargando...</div>;

  const allMovements = getAllMovements();
  const totalPages = Math.ceil(allMovements.length / itemsPerPage);

  // Movimientos a mostrar en la página actual
  const paginatedMovements = allMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Balance Financiero
      </h1>

      {/* Filters Section */}
      <div className="mb-6 p-4 border rounded shadow-sm bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="border rounded p-2"
            title="Fecha Inicio"
          />
          <input
  type="date"
  value={filters.startDate}
  onChange={(e) =>
    setFilters({ ...filters, startDate: e.target.value })
  }
  className="border rounded p-2"
  title="Fecha Inicio"
/>
<input
  type="date"
  value={filters.endDate}
  onChange={(e) =>
    setFilters({ ...filters, endDate: e.target.value })
  }
  className="border rounded p-2"
  title="Fecha Fin"
/>
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
      </div>

      {/* Income by Payment Method Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">
          Ingresos por Método (Detalle)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {/* Cards for each payment method */}
          {[
            { name: "Efectivo", value: ingresosEfectivo, color: "bg-green-50" },
            { name: "Tarjeta", value: ingresosTarjeta, color: "bg-green-50" },
            { name: "Nequi", value: ingresosNequi, color: "bg-green-50" },
            {
              name: "Bancolombia",
              value: ingresosBancolombia,
              color: "bg-green-50",
            },
            { name: "Addi", value: ingresosAddi, color: "bg-yellow-50" }, // Different color
            {
              name: "Sistecredito",
              value: ingresosSistecredito,
              color: "bg-yellow-50",
            }, // Different color
            {
              name: "Venta Online",
              value: totalOnlineSales,
              color: "bg-blue-50",
            },
            {
              name: "Pagos Parciales Reserva",
              value: ingresosPagosParciales,
              color: "bg-purple-50",
            }, // Nueva tarjeta
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
            {/* ...cabecera de la tabla... */}
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
                  {/* ...celdas de la fila... */}
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
        {/* Controles de paginación */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            {"<"}
          </button>
          <span className="px-2 py-1">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="bg-gray-600 text-white py-2 px-5 rounded shadow-md hover:bg-gray-700 transition duration-200"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default Balance;
