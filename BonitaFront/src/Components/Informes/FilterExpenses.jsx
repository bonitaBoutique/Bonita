import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFilteredExpenses } from '../../Redux/Actions/actions';
import ExpenseList from './ExpenseList';

const FilterExpenses = () => {
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.expenses);

  const handleSubmit = (e) => {
    e.preventDefault();
    const filters = {};
    if (type) filters.type = type;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    dispatch(getFilteredExpenses(filters));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-CA', options);
  };

  // Calcular subtotales
  const totalAmount = data.reduce((acc, expense) => acc + expense.amount, 0);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-300 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Filtrar Gastos</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Tipo de Gasto</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Seleccione un tipo</option>
            <option value="Impuestos">Impuestos</option>
            <option value="Nomina Colaboradores">Nomina Colaboradores</option>
            <option value="Nomina Contratistas Externos">Nomina Contratistas Externos</option>
            <option value="Publicidad">Publicidad</option>
            <option value="Servicio Agua">Servicio Agua</option>
            <option value="Servicio Energia">Servicio Energia</option>
            <option value="Servicio Internet">Servicio Internet</option>
            <option value="Suministros">Suministros</option>
            <option value="Viaticos y Transportes">Viaticos y Transportes</option>
          </select>
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-300 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Filtrar Gastos'}
          </button>
        </div>
        {error && <div className="col-span-2 text-red-500">{error}</div>}
      </form>
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Resultados</h3>
        {data.length > 0 ? (
          <>
            <ul>
              {data.map(expense => (
                <li key={expense.id} className="mb-2">
                  <div className="p-4 bg-white rounded-lg shadow-md">
                    <p><strong>Fecha:</strong> {formatDate(expense.date)}</p>
                    <p><strong>Tipo:</strong> {expense.type}</p>
                    <p><strong>Monto:</strong> {expense.amount}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
              <p><strong>Total:</strong> {totalAmount}</p>
            </div>
          </>
        ) : (
          <p>No se encontraron gastos.</p>
        )}
      </div>
      <ExpenseList/>
    </div>
  );
};

export default FilterExpenses;