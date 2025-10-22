import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReturns, fetchReturnById } from '../../Redux/Actions/actions';
import { Link, useNavigate } from 'react-router-dom';
import TruncatedText from '../Informes/TruncatedText';
import * as XLSX from 'xlsx';
import ReturnDetailModal from './ReturnDetailModal';

const ReturnsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Estado Redux
  const {
    data: returns = [],
    pagination,
    stats,
    loading,
    error
  } = useSelector((state) => state.returns.list);

  // ✅ Estados locales para filtros
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  // ✅ Estado para el modal de detalle
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ✅ Cargar datos al montar el componente
  useEffect(() => {
    console.log('🔄 [ReturnsList] Cargando devoluciones iniciales...');
    const loadInitialReturns = async () => {
      try {
        const result = await dispatch(fetchReturns(filters));
        if (result?.error) {
          console.error('❌ Error al cargar devoluciones:', result.error);
        }
      } catch (error) {
        console.error('❌ Error en useEffect:', error);
      }
    };
    
    loadInitialReturns();
  }, []);

  // ✅ Manejar cambios de filtros
  const handleFilterChange = async (field, value) => {
    console.log(`🔄 [ReturnsList] Cambiando filtro ${field} a:`, value);
    const newFilters = { ...filters, [field]: value, page: 1 };
    setFilters(newFilters);
    
    try {
      const result = await dispatch(fetchReturns(newFilters));
      if (result?.error) {
        console.error('❌ Error al aplicar filtros:', result.error);
      }
    } catch (error) {
      console.error('❌ Error en handleFilterChange:', error);
    }
  };

  // ✅ Cambiar página
  const handlePageChange = async (newPage) => {
    console.log('📄 [ReturnsList] Cambiando a página:', newPage);
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    
    try {
      const result = await dispatch(fetchReturns(newFilters));
      if (result?.error) {
        console.error('❌ Error al cambiar página:', result.error);
      }
    } catch (error) {
      console.error('❌ Error en handlePageChange:', error);
    }
  };

  // ✅ Resetear filtros
  const resetFilters = async () => {
    console.log('🔄 [ReturnsList] Reseteando filtros...');
    const newFilters = {
      page: 1,
      limit: 20,
      status: '',
      date_from: '',
      date_to: '',
      search: ''
    };
    setFilters(newFilters);
    
    try {
      const result = await dispatch(fetchReturns(newFilters));
      if (result?.error) {
        console.error('❌ Error al resetear filtros:', result.error);
      }
    } catch (error) {
      console.error('❌ Error en resetFilters:', error);
    }
  };

  // ✅ Abrir modal con detalles completos de la devolución
  const handleViewDetail = async (returnId) => {
    setLoadingDetail(true);
    try {
      const result = await dispatch(fetchReturnById(returnId));
      
      if (result.success && result.data) {
        setSelectedReturn(result.data);
        setShowDetailModal(true);
      } else {
        alert(result.error || 'Error al cargar los detalles de la devolución');
      }
    } catch (error) {
      console.error('❌ Error al cargar detalle de devolución:', error);
      alert('Error al cargar los detalles de la devolución');
    } finally {
      setLoadingDetail(false);
    }
  };

  // ✅ Cerrar modal
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReturn(null);
  };

  // ✅ Formatear fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Obtener color del estado
  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'completada':
      case 'procesada':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'procesando':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ Obtener icono del tipo de devolución
  const getReturnTypeIcon = (type) => {
    switch (type) {
      case 'refund':
        return '💰';
      case 'exchange':
        return '🔄';
      case 'giftcard':
        return '🎁';
      default:
        return '📦';
    }
  };

  // ✅ Obtener motivos de productos devueltos
  const getProductReasons = (returnItem) => {
    if (!returnItem.returned_products || returnItem.returned_products.length === 0) {
      return 'Sin productos devueltos';
    }
    
    const reasons = returnItem.returned_products
      .map(product => product.reason)
      .filter(reason => reason && reason.trim() !== '')
      .join(', ');
    
    return reasons || 'Sin especificar';
  };

  // ✅ Exportar a Excel
  const handleExportToExcel = () => {
    if (!returns || returns.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Preparar datos para Excel
    const excelData = returns.map((returnItem, index) => ({
      '#': index + 1,
      'ID_Devolución': returnItem.id_return,
      'Fecha': formatDate(returnItem.return_date),
      'Recibo_Original': returnItem.original_receipt_id,
      'Cliente': returnItem.originalReceipt?.buyer_name || 'Cliente genérico',
      'Email': returnItem.originalReceipt?.buyer_email || 'N/A',
      'Cajero': `${returnItem.cashier?.first_name || ''} ${returnItem.cashier?.last_name || ''}`.trim(),
      'Estado': returnItem.status,
      'Total_Devuelto': parseFloat(returnItem.total_returned || 0),
      'Total_Nueva_Compra': parseFloat(returnItem.total_new_purchase || 0),
      'Diferencia': parseFloat(returnItem.difference_amount || 0),
      'Motivo': getProductReasons(returnItem),
      'Nuevo_Recibo': returnItem.new_receipt_id || 'N/A',
      'Productos_Devueltos': returnItem.returned_products?.length || 0,
      'Productos_Nuevos': returnItem.new_products?.length || 0
    }));

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    
    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 5 },   // #
      { wch: 20 },  // ID_Devolución
      { wch: 18 },  // Fecha
      { wch: 15 },  // Recibo_Original
      { wch: 25 },  // Cliente
      { wch: 30 },  // Email
      { wch: 25 },  // Cajero
      { wch: 12 },  // Estado
      { wch: 15 },  // Total_Devuelto
      { wch: 18 },  // Total_Nueva_Compra
      { wch: 12 },  // Diferencia
      { wch: 30 },  // Motivo
      { wch: 15 },  // Nuevo_Recibo
      { wch: 18 },  // Productos_Devueltos
      { wch: 15 }   // Productos_Nuevos
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Devoluciones');

    // Generar nombre de archivo
    const fechaExportacion = new Date().toLocaleDateString('es-CO').replace(/\//g, '-');
    let nombreArchivo = `Devoluciones_${fechaExportacion}`;
    
    if (filters.date_from && filters.date_to) {
      nombreArchivo += `_${filters.date_from}_a_${filters.date_to}`;
    }
    
    if (filters.status) {
      nombreArchivo += `_${filters.status}`;
    }

    // Descargar archivo
    XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
    
    alert(`📊 Excel exportado exitosamente!\n\n📄 Registros: ${returns.length}\n📁 Archivo: ${nombreArchivo}.xlsx`);
  };

  // ✅ Estados de carga
  if (loading && returns.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando devoluciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mt-24">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error al cargar devoluciones
          </h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={async () => {
              try {
                const result = await dispatch(fetchReturns(filters));
                if (result?.error) {
                  console.error('❌ Error al reintentar:', result.error);
                }
              } catch (error) {
                console.error('❌ Error en botón reintentar:', error);
              }
            }}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          🔄 Historial de Devoluciones
        </h1>
        <Link 
          to="/returns/management"
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
        >
          ➕ Nueva Devolución
        </Link>
      </div>

      {/* ✅ Estadísticas generales */}
      {stats && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <h3 className="text-sm font-medium text-green-800">Total Devoluciones</h3>
            <p className="text-2xl font-bold text-green-900">{stats.total_returns || 0}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="text-sm font-medium text-blue-800">Monto Total</h3>
            <p className="text-2xl font-bold text-blue-900">
              ${(stats.total_amount || 0).toLocaleString('es-CO')}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <h3 className="text-sm font-medium text-yellow-800">Pendientes</h3>
            <p className="text-2xl font-bold text-yellow-900">{stats.pending_returns || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
            <h3 className="text-sm font-medium text-purple-800">Este Mes</h3>
            <p className="text-2xl font-bold text-purple-900">{stats.monthly_returns || 0}</p>
          </div>
        </div>
      )}

      {/* ✅ Filtros */}
      <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          🔍 Filtros de Búsqueda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📊 Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los Estados</option>
              <option value="Procesada">Procesada</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Fecha Desde
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Fecha Hasta
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📄 Por Página
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">10 por página</option>
              <option value="20">20 por página</option>
              <option value="50">50 por página</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button
            onClick={resetFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
          >
            🔄 Resetear Filtros
          </button>
          <button
            onClick={async () => {
              try {
                const result = await dispatch(fetchReturns(filters));
                if (result?.error) {
                  console.error('❌ Error en búsqueda manual:', result.error);
                }
              } catch (error) {
                console.error('❌ Error en botón buscar:', error);
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            disabled={loading}
          >
            {loading ? '🔄 Cargando...' : '🔍 Buscar'}
          </button>
          <button
            onClick={handleExportToExcel}
            disabled={!returns || returns.length === 0 || loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📊 Exportar Excel ({returns?.length || 0} registros)
          </button>
        </div>
      </div>

      {/* ✅ Información de Paginación */}
      {pagination && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <p className="text-sm text-blue-800">
            <strong>📊 Resultados:</strong> Mostrando {returns.length} de {pagination.totalItems || 0} devoluciones
            {pagination.totalPages > 1 && (
              <span className="ml-2">
                (Página {pagination.currentPage} de {pagination.totalPages})
              </span>
            )}
          </p>
        </div>
      )}

      {/* ✅ Tabla de Devoluciones */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">📅 Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🆔 ID Devolución</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🧾 Recibo Original</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">👤 Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">�‍💼 Cajero</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">📊 Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">💰 Total Devuelto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">📝 Motivo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">🔧 Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {returns.length > 0 ? (
              returns.map((returnItem) => (
                <tr
                  key={returnItem.id_return || returnItem.id}
                  className="transition-colors duration-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(returnItem.return_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {returnItem.id_return}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    #{returnItem.original_receipt_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div>
                      <div className="font-medium">{returnItem.originalReceipt?.buyer_name || 'Cliente genérico'}</div>
                      <div className="text-gray-500 text-xs">{returnItem.originalReceipt?.buyer_email || 'Sin email'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div>
                      <div className="font-medium">
                        {`${returnItem.cashier?.first_name || ''} ${returnItem.cashier?.last_name || ''}`.trim() || 'Sin asignar'}
                      </div>
                      <div className="text-gray-500 text-xs">{returnItem.cashier?.n_document || ''}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status.toLowerCase())}`}>
                      {returnItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-red-600">
                    ${parseFloat(returnItem.total_returned || 0).toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <TruncatedText text={getProductReasons(returnItem)} maxLength={30} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => handleViewDetail(returnItem.id_return)}
                      disabled={loadingDetail}
                      className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-xs transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      👁️ Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>No hay devoluciones para mostrar</p>
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

        {/* ✅ Controles de paginación */}
        {pagination?.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || loading}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ← Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages || loading}
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
                    {(pagination.currentPage - 1) * pagination.limit + 1}
                  </span>{" "}
                  a{" "}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}
                  </span>{" "}
                  de <span className="font-medium">{pagination.totalItems}</span>{" "}
                  resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.currentPage === 1 || loading}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {"<<"}
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || loading}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {"<"}
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages || loading}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {">"}
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages || loading}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {">>"}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Botón Volver */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-gray-700 transition duration-200 flex items-center mx-auto"
        >
          ← Volver
        </button>
      </div>

      {/* ✅ Modal de Detalle */}
      <ReturnDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        returnData={selectedReturn}
      />
    </div>
  );
};

export default ReturnsList;