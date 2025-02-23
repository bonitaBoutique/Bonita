import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBalance } from '../../Redux/Actions/actions';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const Balance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    balance = 0,
    totalIncome = 0,
    totalOnlineSales = 0,
    totalLocalSales = 0,
    totalExpenses = 0,
    income = { online: [], local: [] },
    expenses = [],
    cashierTotals = {}, // Add cashierTotals to the state
    loading
  } = useSelector(state => state);

  console.log('Redux State:', {
    balance,
    totalIncome,
    totalOnlineSales,
    totalLocalSales,
    totalExpenses,
    income,
    expenses,
    cashierTotals
  });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: '',
    expenseType: '',
    cashier: '' // Add cashier filter
  });

  useEffect(() => {
    dispatch(fetchBalance(filters));
  }, [dispatch, filters]);

  const getAllMovements = () => {
    const movements = [
      ...(income.online || []).map(sale => ({
        ...sale,
        type: 'Venta Online',
        amount: sale.amount,
        date: new Date(sale.date),
        paymentMethod: sale.payMethod // Agregado para ventas online
      })),
      ...(income.local || []).map(sale => ({
        ...sale,
        type: 'Venta Local',
        amount: sale.total_amount,
        date: new Date(sale.date),
        paymentMethod: sale.payMethod // Agregado para ventas locales
      })),
      ...(Array.isArray(expenses) ? expenses : []).map(expense => ({
        ...expense,
        ...expense,
        type: `Gasto - ${expense.type}`,
        amount: -expense.amount,
        date: new Date(expense.date),
        paymentMethod: expense.paymentMethods
      }))
    ];

    let filteredMovements = movements;

    if (filters.expenseType) {
      filteredMovements = filteredMovements.filter(movement =>
        movement.type === `Gasto - ${filters.expenseType}`
      );
    }

    // Agregar console.log para inspeccionar cada movimiento
    filteredMovements.forEach(movement => {
      console.log('Movement:', movement);
    });

    return filteredMovements.sort((a, b) => b.date - a.date);
  };

  const handleExportExcel = () => {
    const movements = getAllMovements();
    const ws = XLSX.utils.json_to_sheet(movements.map(m => ({
      Fecha: m.date.toLocaleDateString(),
      Tipo: m.type,
      Descripción: m.description || '-',
      'Método de Pago': m.paymentMethod,
      Monto: Math.abs(m.amount).toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP'
      })
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Balance');
    XLSX.writeFile(wb, `balance_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Calcular ingresos por método de pago
  const ingresosEfectivo = (income.local || []).filter(sale => sale.payMethod === 'Efectivo').reduce((acc, sale) => acc + sale.total_amount, 0);
  const ingresosTarjeta = (income.local || []).filter(sale => sale.payMethod === 'Tarjeta').reduce((acc, sale) => acc + sale.total_amount, 0);
  const ingresosNequi = (income.local || []).filter(sale => sale.payMethod === 'Nequi').reduce((acc, sale) => acc + sale.total_amount, 0);
  const ingresosBancolombia = (income.local || []).filter(sale => sale.payMethod === 'Bancolombia').reduce((acc, sale) => acc + sale.total_amount, 0);

  // Get unique cashiers for the filter
  const cashiers = [...new Set((income.local || []).map(sale => sale.cashier_document))];

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <input
          type="date"
          value={filters.startDate}
          onChange={e => setFilters({ ...filters, startDate: e.target.value })}
          className="border rounded p-2"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={e => setFilters({ ...filters, endDate: e.target.value })}
          className="border rounded p-2"
        />
        <select
          value={filters.paymentMethod}
          onChange={e => setFilters({ ...filters, paymentMethod: e.target.value })}
          className="border rounded p-2"
        >
          <option value="">Todos los métodos</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Nequi">Nequi</option>
          <option value="Bancolombia">Bancolombia</option>
        </select>
        <select
          value={filters.expenseType}
          onChange={e => setFilters({ ...filters, expenseType: e.target.value })}
          className="border rounded p-2"
        >
          <option value="">Todos los tipos de gasto</option>
          <option value="Nomina Colaboradores">Nómina Colaboradores</option>
          <option value="Servicios">Servicios</option>
          <option value="Arriendo">Arriendo</option>
          <option value="Proveedores">Proveedores</option>
          <option value="Otros">Otros</option>
        </select>
        {/* Cashier Filter */}
        <select
          value={filters.cashier}
          onChange={e => setFilters({ ...filters, cashier: e.target.value })}
          className="border rounded p-2"
        >
          <option value="">Todos los cajeros</option>
          {cashiers.map(cashier => (
            <option key={cashier} value={cashier}>{cashier}</option>
          ))}
        </select>
      </div>

      {/* Ingresos por Método de Pago */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded">
          <h3 className="text-lg font-semibold">Efectivo</h3>
          <p className="text-2xl">${ingresosEfectivo}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <h3 className="text-lg font-semibold">Tarjeta</h3>
          <p className="text-2xl">${ingresosTarjeta}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <h3 className="text-lg font-semibold">Nequi</h3>
          <p className="text-2xl">${ingresosNequi}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <h3 className="text-lg font-semibold">Bancolombia</h3>
          <p className="text-2xl">${ingresosBancolombia}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <h3 className="text-lg font-semibold">Venta Online</h3>
          <p className="text-2xl">${totalOnlineSales}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded">
          <h3 className="text-lg font-semibold">Ingresos Totales</h3>
          <p className="text-2xl">${totalIncome}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <h3 className="text-lg font-semibold">Gastos Totales</h3>
          <p className="text-2xl">${totalExpenses}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="text-lg font-semibold">Balance</h3>
          <p className="text-2xl">${balance}</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="bg-indigo-600 text-white p-4 rounded hover:bg-indigo-700"
        >
          Exportar Excel
        </button>
      </div>

      {/* Cashier Totals */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Ventas por Cajero</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(cashierTotals)
            .filter(([cashier]) => !filters.cashier || cashier === filters.cashier) // Apply cashier filter
            .map(([cashier, total]) => (
              <div key={cashier} className="bg-yellow-50 p-4 rounded">
                <h3 className="text-lg font-semibold">{cashier}</h3>
                <p className="text-2xl">${total}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Movements Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getAllMovements().map((movement, index) => (
              <tr key={index} className={movement.amount < 0 ? 'bg-red-50' : 'bg-green-50'}>
                <td className="px-6 py-4 whitespace-nowrap">{movement.date.toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{movement.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{movement.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{movement.paymentMethod || 'Wompi'}</td>
                <td className={`px-6 py-4 whitespace-nowrap font-semibold ${movement.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${Math.abs(movement.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white p-4 rounded hover:bg-gray-700"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default Balance;