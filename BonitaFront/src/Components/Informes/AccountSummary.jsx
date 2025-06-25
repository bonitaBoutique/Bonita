import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getClientAccountBalance } from "../../Redux/Actions/actions"; // ✅ Usar la misma action
import { useParams, useNavigate } from "react-router-dom";

const AccountSummary = (props) => {
  const params = useParams();
  const navigate = useNavigate();
  const n_document = props.n_document || params.n_document;

  const dispatch = useDispatch();
  
  // ✅ CAMBIAR: Usar clientAccountBalance en lugar de accountSummary
  const { user, orderDetails, loading, error } = useSelector((state) => state.clientAccountBalance);

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  console.log('🔍 AccountSummary - Datos del Redux:', {
    user,
    orderDetails,
    loading,
    error,
    n_document
  });

  useEffect(() => {
    if (n_document) {
      console.log('📞 Llamando getClientAccountBalance con:', n_document);
      // ✅ CAMBIAR: Usar la misma action que ClientAccountBalance
      dispatch(getClientAccountBalance(n_document));
    }
  }, [dispatch, n_document]);

  // Reiniciar página si cambian los datos
  useEffect(() => {
    setCurrentPage(1);
  }, [orderDetails]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <div className="text-center text-red-500 py-8">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold mb-2">Error al cargar información</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => dispatch(getClientAccountBalance(n_document))}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200 mr-2"
          >
            🔄 Reintentar
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-200"
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-lg font-semibold mb-2">Cliente no encontrado</h3>
          <p className="text-gray-600 mb-4">
            No se encontró información para el documento: <strong>{n_document}</strong>
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-200"
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  // ✅ CAMBIAR: Usar orderDetails directamente (ya es un array según el reducer)
  const movimientos = (orderDetails || [])
    .map(order => ({
      tipo: "orden",
      fecha: order.createdAt || order.date,
      ...order,
    }))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Orden descendente por fecha

  // Paginación
  const totalPages = Math.ceil(movimientos.length / itemsPerPage);
  const paginatedMovimientos = movimientos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✅ Calcular estadísticas del cliente
  const totalOrdenes = orderDetails.length;
  const totalMonto = orderDetails.reduce((sum, order) => sum + (order.amount || 0), 0);
  const ordenesPendientes = orderDetails.filter(order => 
    order.state_order && order.state_order.toLowerCase().includes('pendiente')
  ).length;
  const ordenesCompletadas = orderDetails.filter(order => 
    order.state_order && (
      order.state_order.toLowerCase().includes('completad') ||
      order.state_order.toLowerCase().includes('entregad') ||
      order.state_order.toLowerCase().includes('finalizada')
    )
  ).length;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      {/* ✅ Header con información del cliente */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
              👤 Resumen de Cuenta Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Información Personal:</h3>
                <p className="text-lg"><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
                <p><strong>Documento:</strong> {user.n_document}</p>
                <p><strong>Email:</strong> {user.email || 'No registrado'}</p>
                <p><strong>Teléfono:</strong> {user.phone || 'No registrado'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Estadísticas:</h3>
                <p><strong>Total Órdenes:</strong> {totalOrdenes}</p>
                <p><strong>Monto Total:</strong> {totalMonto.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}</p>
                <p><strong>Pendientes:</strong> {ordenesPendientes}</p>
                <p><strong>Completadas:</strong> {ordenesCompletadas}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-200 flex items-center"
          >
            ← Volver
          </button>
        </div>
      </div>

      {/* ✅ Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg text-center border-l-4 border-blue-500">
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-semibold text-blue-800">Total Órdenes</h3>
          <p className="text-2xl font-bold text-blue-900">{totalOrdenes}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg text-center border-l-4 border-green-500">
          <div className="text-2xl mb-2">💰</div>
          <h3 className="font-semibold text-green-800">Monto Total</h3>
          <p className="text-lg font-bold text-green-900">
            {totalMonto.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            })}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg text-center border-l-4 border-yellow-500">
          <div className="text-2xl mb-2">⏳</div>
          <h3 className="font-semibold text-yellow-800">Pendientes</h3>
          <p className="text-2xl font-bold text-yellow-900">{ordenesPendientes}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg text-center border-l-4 border-purple-500">
          <div className="text-2xl mb-2">✅</div>
          <h3 className="font-semibold text-purple-800">Completadas</h3>
          <p className="text-2xl font-bold text-purple-900">{ordenesCompletadas}</p>
        </div>
      </div>

      {/* ✅ Tabla de órdenes mejorada */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          📋 Historial de Órdenes
          <span className="ml-2 text-sm font-normal text-gray-600">
            ({movimientos.length} registros)
          </span>
        </h3>
        
        {paginatedMovimientos.length > 0 ? (
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📅 Fecha
                  </th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🆔 ID Orden
                  </th>
                  <th className="py-3 px-4 border-b text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    💰 Monto
                  </th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📊 Estado
                  </th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    💳 Transacción
                  </th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🏪 Punto de Venta
                  </th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🔗 Reservas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedMovimientos.map((mov, idx) => (
                  <tr key={mov.id_orderDetail || idx} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(mov.fecha).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-gray-700">
                      {mov.id_orderDetail ? 
                        `${mov.id_orderDetail.substring(0, 8)}...` : 
                        'N/A'
                      }
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-right text-green-600">
                      {mov.amount ? 
                        mov.amount.toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                        }) : 
                        'N/A'
                      }
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mov.state_order?.toLowerCase().includes('completad') || 
                        mov.state_order?.toLowerCase().includes('entregad') || 
                        mov.state_order?.toLowerCase().includes('finalizada')
                          ? 'bg-green-100 text-green-800'
                          : mov.state_order?.toLowerCase().includes('pendiente')
                          ? 'bg-yellow-100 text-yellow-800'
                          : mov.state_order?.toLowerCase().includes('cancelad')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {mov.state_order || 'Sin estado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mov.transaction_status === 'Aprobado'
                          ? 'bg-green-100 text-green-800'
                          : mov.transaction_status === 'Pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : mov.transaction_status === 'Rechazado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {mov.transaction_status || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mov.pointOfSale === 'Online'
                          ? 'bg-blue-100 text-blue-800'
                          : mov.pointOfSale === 'Local'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {mov.pointOfSale || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {mov.Reservations && mov.Reservations.length > 0 ? (
                        <div className="space-y-1">
                          {mov.Reservations.map((reservation, resIdx) => (
                            <div key={reservation.id_reservation || resIdx} className="text-xs bg-purple-50 p-2 rounded border">
                              <p><strong>ID:</strong> {reservation.id_reservation}</p>
                              <p><strong>Pagado:</strong> {reservation.totalPaid?.toLocaleString("es-CO", {
                                style: "currency",
                                currency: "COP",
                              }) || 'N/A'}</p>
                              <p><strong>Vencimiento:</strong> {reservation.dueDate ? new Date(reservation.dueDate).toLocaleDateString('es-CO') : 'N/A'}</p>
                              <p><strong>Estado:</strong> 
                                <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                                  reservation.status === 'Completada' ? 'bg-green-100 text-green-800' :
                                  reservation.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {reservation.status}
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin reservas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ✅ Controles de paginación mejorados */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
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
                        {Math.min(currentPage * itemsPerPage, movimientos.length)}
                      </span>{" "}
                      de <span className="font-medium">{movimientos.length}</span>{" "}
                      resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        title="Primera página"
                      >
                        {"<<"}
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        title="Página anterior"
                      >
                        {"<"}
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        title="Página siguiente"
                      >
                        {">"}
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
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
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-gray-200 border-dashed">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin órdenes registradas</h3>
            <p className="text-gray-500">Este cliente aún no tiene órdenes en el sistema.</p>
          </div>
        )}
      </div>

      {/* ✅ Información adicional del cliente */}
      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">ℹ️ Información Adicional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>Fecha de registro:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-CO') : 'No disponible'}</p>
            <p><strong>Última actualización:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('es-CO') : 'No disponible'}</p>
          </div>
          <div>
            <p><strong>Estado del cliente:</strong> {user.deletedAt ? '❌ Inactivo' : '✅ Activo'}</p>
            <p><strong>Promedio por orden:</strong> {totalOrdenes > 0 ? (totalMonto / totalOrdenes).toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            }) : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;