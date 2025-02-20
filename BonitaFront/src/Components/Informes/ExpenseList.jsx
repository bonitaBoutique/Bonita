import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFilteredExpenses, deleteExpense } from '../../Redux/Actions/actions';
import { formatCurrency } from '../../formatCurrency';
import Swal from 'sweetalert2'; // Importa SweetAlert

const ExpenseList = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const expenses = useSelector(state => state.expenses?.data || []);
  const loading = useSelector(state => state.expenses?.loading);
  const error = useSelector(state => state.expenses?.error);


  useEffect(() => {
    dispatch(getFilteredExpenses({}));
  }, [dispatch]);

  if (loading) return <div>Cargando gastos...</div>;
  if (error) return <div>Error: {error}</div>;

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
        )
      }
    })
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = expenses.slice(indexOfFirstItem, indexOfLastItem);


  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-CA', options);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-300 rounded-lg shadow-xl">
     <div>
      
 
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
                 <th className="py-2 px-4 border-b">Descripción</th>
                <th  className="py-2 px-4 border-b">Metodo de Pago</th>
                <th className="py-2 px-4 border-b">Monto</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.map(expense => (
                <tr key={expense.id}>
                  <td className="py-2 px-4 border-b">{formatDate(expense.date)}</td>
                  <td className="py-2 px-4 border-b">{expense.type}</td>
                  <td className="border px-4 py-2">{expense.description}</td>
                  <td className="border px-4 py-2">{expense.paymentMethods}</td>
                  <td className="border px-4 py-2">{formatCurrency(expense.amount)}</td>
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
          {Array.from({ length: Math.ceil(expenses.length / itemsPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 ${
              currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
                 {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default ExpenseList;