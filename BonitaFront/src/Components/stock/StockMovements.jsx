import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar2 from '../Navbar2';
import TruncatedText from '../Informes/TruncatedText';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    dateFrom: '',
    dateTo: '',
    productSearch: ''
  });

  // ✅ FUNCIÓN PARA OBTENER MOVIMIENTOS AJUSTADA A TU API
  const fetchMovements = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page.toString(),
        limit: '20',
        ...(filters.type && { type: filters.type }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      };

      // ✅ USAR AXIOS CON LA RUTA CORRECTA
      const response = await axios.get('/product/stock-movements', {
        params,
        timeout: 10000
      });

      console.log('Response data:', response.data); // Para debug

      // ✅ AJUSTAR A LA ESTRUCTURA REAL DE TU API
      if (response.data.status === 'success' && response.data.message) {
        const apiData = response.data.message;
        let filteredData = apiData.data || [];
        
        // ✅ FILTRO LOCAL POR BÚSQUEDA DE PRODUCTO
        if (filters.productSearch) {
          const searchTerm = filters.productSearch.toLowerCase();
          filteredData = filteredData.filter(movement => 
            movement.Product?.description?.toLowerCase().includes(searchTerm) ||
            movement.Product?.codigoBarra?.toLowerCase().includes(searchTerm) ||
            movement.Product?.marca?.toLowerCase().includes(searchTerm)
          );
        }

        setMovements(filteredData);
        setTotalPages(apiData.pagination?.totalPages || 1);
        setCurrentPage(apiData.pagination?.page || page);
      } else {
        setError('Formato de respuesta inesperado del servidor');
        setMovements([]);
      }
    } catch (err) {
      console.error('Error fetching movements:', err);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (err.response) {
        const status = err.response.status;
        switch (status) {
          case 404:
            errorMessage = 'Endpoint no encontrado. Verifica que el backend esté funcionando.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor.';
            break;
          case 401:
            errorMessage = 'No autorizado. Verifica tu sesión.';
            break;
          case 403:
            errorMessage = 'Acceso denegado.';
            break;
          default:
            errorMessage = `Error del servidor: ${status} - ${err.response.statusText}`;
        }
      } else if (err.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica que esté ejecutándose.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'La petición tardó demasiado tiempo. Intenta nuevamente.';
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CARGAR DATOS AL MONTAR COMPONENTE
  useEffect(() => {
    fetchMovements(1);
  }, [filters.type, filters.dateFrom, filters.dateTo]);

  // ✅ MANEJAR CAMBIOS EN FILTROS
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // ✅ APLICAR FILTRO DE BÚSQUEDA
  const handleSearch = () => {
    fetchMovements(1);
  };

  // ✅ LIMPIAR FILTROS
  const clearFilters = () => {
    setFilters({
      type: '',
      dateFrom: '',
      dateTo: '',
      productSearch: ''
    });
    fetchMovements(1);
  };

  // ✅ PAGINACIÓN
  const handlePageChange = (page) => {
    fetchMovements(page);
  };

  // ✅ FORMATEAR FECHA MEJORADO
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString; // Fallback si hay error
    }
  };

  // ✅ OBTENER COLOR DEL TIPO DE MOVIMIENTO
  const getTypeColor = (type) => {
    return type === 'IN' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  // ✅ ESTADÍSTICAS RÁPIDAS
  const stats = {
    total: movements.length,
    entradas: movements.filter(m => m.type === 'IN').length,
    salidas: movements.filter(m => m.type === 'OUT').length,
    totalEntradas: movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
    totalSalidas: movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0)
  };

  if (loading) {
    return (
      <>
        <Navbar2 />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando movimientos de stock...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar2 />
      <div className="min-h-screen bg-gray-100 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ✅ HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Movimientos de Stock
            </h1>
            <p className="text-gray-600">
              Historial completo de entradas y salidas de inventario
            </p>
          </div>

          {/* ✅ MOSTRAR ERROR SI EXISTE */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-red-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <span className="sr-only">Cerrar</span>
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ ESTADÍSTICAS RÁPIDAS */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Movimientos</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.entradas}</div>
              <div className="text-sm text-gray-600">Entradas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.salidas}</div>
              <div className="text-sm text-gray-600">Salidas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">+{stats.totalEntradas}</div>
              <div className="text-sm text-gray-600">Unidades Ingresadas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-red-600">-{stats.totalSalidas}</div>
              <div className="text-sm text-gray-600">Unidades Salidas</div>
            </div>
          </div>

          {/* ✅ FILTROS */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h3 className="text-lg font-semibold mb-4">🔍 Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Tipo de movimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Movimiento
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="IN">Entradas</option>
                  <option value="OUT">Salidas</option>
                </select>
              </div>

              {/* Fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buscar producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Producto
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={filters.productSearch}
                    onChange={(e) => handleFilterChange('productSearch', e.target.value)}
                    placeholder="Código, descripción o marca..."
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
                  >
                    🔍
                  </button>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Limpiar Filtros
              </button>
              <button
                onClick={() => fetchMovements(1)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Actualizar
              </button>
            </div>
          </div>

          {/* ✅ TABLA DE MOVIMIENTOS */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Movimiento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.map((movement, index) => (
                    <tr key={movement.id_movement || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(movement.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(movement.type)}`}>
                          {movement.type === 'IN' ? '📥 Entrada' : '📤 Salida'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <TruncatedText 
                          text={movement.Product?.description || 'Producto no encontrado'} 
                          maxLength={50} 
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {movement.Product?.marca}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.Product?.codigoBarra || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={movement.type === 'IN' ? 'text-green-600' : 'text-red-600'}>
                          {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <TruncatedText 
                          text={movement.id_movement} 
                          maxLength={20} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ MENSAJE SI NO HAY DATOS */}
            {movements.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay movimientos de stock
                </h3>
                <p className="text-gray-600">
                  No se encontraron movimientos con los filtros aplicados.
                </p>
                <button
                  onClick={() => fetchMovements(1)}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Recargar
                </button>
              </div>
            )}
          </div>

          {/* ✅ INFO DE RESULTADOS */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Mostrando {movements.length} movimientos
          </div>
        </div>
      </div>
    </>
  );
};

export default StockMovements;