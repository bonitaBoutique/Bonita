import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFilteredExpenses, deleteExpense } from '../../Redux/Actions/actions';
import ExpenseList from './ExpenseList'; // Asegúrate que este componente no interfiera o úsalo si es relevante
import Swal from 'sweetalert2';

const FilterExpenses = () => {
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destinatario, setDestinatario] = useState(''); // <-- 1. Nuevo estado
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector(state => state.expenses); // Asumiendo que los gastos filtrados se guardan aquí

  // ✅ DEBUG: Ver qué está llegando en data
  console.log("🔍 DEBUG - data from Redux:", data);
  console.log("🔍 DEBUG - type of data:", typeof data);
  console.log("🔍 DEBUG - is Array:", Array.isArray(data));

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filters = {};
    if (type) filters.type = type;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (destinatario) filters.destinatario = destinatario; // <-- 3. Incluir destinatario en filtros
    dispatch(getFilteredExpenses(filters));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Asegurarse que la fecha se interpreta correctamente (puede necesitar ajustar zona horaria si hay problemas)
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }; // Usar UTC para evitar problemas de zona horaria
    return date.toLocaleDateString('es-CO', options); // Formato Colombiano
  };

  // ✅ SOLUCIÓN: Calcular subtotales de forma segura
  const getExpensesArray = () => {
    // Si data es un array, usarlo directamente
    if (Array.isArray(data)) {
      return data;
    }
    // Si data es un objeto con una propiedad array (ej: data.expenses)
    if (data && Array.isArray(data.expenses)) {
      return data.expenses;
    }
    // Si data es un objeto con otra estructura (ej: data.data)
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    // Si nada funciona, retornar array vacío
    return [];
  };

  const expensesArray = getExpensesArray();
  const totalAmount = expensesArray.reduce((acc, expense) => acc + (parseFloat(expense.amount) || 0), 0);

  // Función para eliminar gasto con confirmación
  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteExpense(id));
        Swal.fire(
          'Eliminado!',
          'El gasto ha sido eliminado.',
          'success'
        );
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-300 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Filtrar Gastos</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* ... Tipo, Fecha Inicio, Fecha Fin ... */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Tipo de Gasto</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Todos los tipos</option> {/* Cambiado para permitir "todos" */}
            <option value="Impuestos">Impuestos</option>
            <option value="Nomina Colaboradores">Nomina Colaboradores</option>
            <option value="Nomina Contratistas Externos">Nomina Contratistas Externos</option>
            <option value="Seguridad Social">Seguridad Social</option> {/* Agregado si falta */}
            <option value="Publicidad">Publicidad</option>
            <option value="Servicio Agua">Servicio Agua</option>
            <option value="Servicio Energia">Servicio Energia</option>
            <option value="Servicio Internet">Servicio Internet</option>
            <option value="Suministros">Suministros</option>
            <option value="Viaticos y Transportes">Viaticos y Transportes</option>
            <option value="Inventario">Inventario</option>
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

        {/* <-- 2. Nuevo Input para Destinatario --> */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Destinatario</label>
          <input
            type="text"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Filtrar por nombre de destinatario..."
          />
        </div>

        <div className="col-span-2">
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-300 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Filtrando...' : 'Filtrar Gastos'}
          </button>
        </div>
        {error && <div className="col-span-2 text-red-500">Error: {typeof error === 'object' ? JSON.stringify(error) : error}</div>}
      </form>

      {/* Resultados */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Resultados</h3>
        {loading && <p>Cargando resultados...</p>}
        {!loading && expensesArray && expensesArray.length > 0 ? (
          <>
            <ul className="space-y-3">
              {expensesArray.map(expense => (
                <li key={expense.id} className="p-4 bg-white rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p><strong>Fecha:</strong> {formatDate(expense.date)}</p>
                    <p><strong>Tipo:</strong> {expense.type}</p>
                    <p><strong>Destinatario:</strong> {expense.destinatario || 'N/A'}</p>
                    <p><strong>Descripción:</strong> {expense.description || 'N/A'}</p>
                    <p><strong>Método Pago:</strong> {expense.paymentMethods || 'N/A'}</p>
                    <p><strong>Monto:</strong> ${ (parseFloat(expense.amount) || 0).toLocaleString('es-CO')}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="mt-2 md:mt-0 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-inner font-bold text-lg">
              <p>Total Gastos Filtrados: ${totalAmount.toLocaleString('es-CO')}</p>
            </div>
          </>
        ) : (
          !loading && <p>No se encontraron gastos con los filtros aplicados.</p>
        )}
      </div>

      {/* <ExpenseList/> */} {/* Comentado si no se usa o si muestra datos diferentes */}

      <button
            type="button"
            onClick={handleBack}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 mt-4 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Volver
          </button>
    </div>
  );
};

export default FilterExpenses;