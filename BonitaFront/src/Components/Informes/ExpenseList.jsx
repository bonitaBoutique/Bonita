import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFilteredExpenses, deleteExpense } from '../../Redux/Actions/actions';

const ExpenseList = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.expenses);
  const [currentPage, setCurrentPage] = useState(1);
  const [expensesPerPage] = useState(10);

  useEffect(() => {
    dispatch(getFilteredExpenses({}));
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteExpense(id));
  };

  // Paginación
  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = data.slice(indexOfFirstExpense, indexOfLastExpense);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-CA', options);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-300 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Lista de Gastos</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Fecha</th>
                <th className="py-2 px-4 border-b">Tipo</th>
                <th className="py-2 px-4 border-b">Monto</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.map(expense => (
                <tr key={expense.id}>
                  <td className="py-2 px-4 border-b">{formatDate(expense.date)}</td>
                  <td className="py-2 px-4 border-b">{expense.type}</td>
                  <td className="py-2 px-4 border-b">{expense.amount}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            {Array.from({ length: Math.ceil(data.length / expensesPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-4 py-2 mx-1 ${currentPage === i + 1 ? 'bg-pink-300 text-white' : 'bg-gray-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;