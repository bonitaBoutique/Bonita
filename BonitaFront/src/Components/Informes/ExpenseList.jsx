import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFilteredExpenses,
  deleteExpense,
} from "../../Redux/Actions/actions";
import { formatCurrency } from "../../formatCurrency";
import { formatDateForDisplay } from "../../utils/dateUtils";
import Swal from "sweetalert2";
import TruncatedText from "./TruncatedText"; // ✅ Ya lo tienes importado

const ExpenseList = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const expenses = useSelector((state) => state.expenses?.data || []);
  const loading = useSelector((state) => state.expenses?.loading);
  const error = useSelector((state) => state.expenses?.error);

  useEffect(() => {
    dispatch(getFilteredExpenses({}));
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar!",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteExpense(id));
        Swal.fire("Eliminado!", "El gasto ha sido eliminado.", "success");
      }
    });
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = expenses.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-CA", options);
  };

  if (loading)
    return <div className="text-center py-8">Cargando gastos...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-300 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Lista de Gastos</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">
                Fecha
              </th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">
                Tipo
              </th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">
                Descripción
              </th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">
                Método de Pago
              </th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">
                Monto
              </th>
              <th className="py-3 px-4 border-b font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {currentExpenses.map((expense, index) => (
              <tr
                key={expense.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition-colors`}
              >
                <td className="py-3 px-4 border-b text-sm">
                  {formatDateForDisplay(expense.date)}
                </td>
                <td className="py-3 px-4 border-b text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {expense.type}
                  </span>
                </td>
                {/* ✅ AQUÍ USAR TruncatedText */}
                <td className="py-3 px-4 border-b text-sm max-w-xs">
                  <TruncatedText text={expense.description} maxLength={100} />
                </td>
                <td className="py-3 px-4 border-b text-sm">
                  {expense.paymentMethods}
                </td>
                <td className="py-3 px-4 border-b text-sm font-semibold">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="py-3 px-4 border-b text-sm">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200"
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ MEJORAR LA PAGINACIÓN */}
      {expenses.length > itemsPerPage && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            {Array.from({
              length: Math.ceil(expenses.length / itemsPerPage),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-2 rounded transition-colors duration-200 ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ✅ MENSAJE SI NO HAY GASTOS */}
      {expenses.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-600">No hay gastos registrados</p>
        </div>
      )}

      {/* ✅ INFORMACIÓN ADICIONAL */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Total de gastos:</strong> {expenses.length} registros
        </p>
        <p className="text-sm text-blue-800">
          <strong>Página actual:</strong> {currentPage} de{" "}
          {Math.ceil(expenses.length / itemsPerPage)}
        </p>
      </div>
    </div>
  );
};

export default ExpenseList;
