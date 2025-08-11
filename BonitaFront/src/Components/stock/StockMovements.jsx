import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockMovements } from '../../Redux/Actions/actions';
import TruncatedText from '../Informes/TruncatedText';
import * as XLSX from 'xlsx';

const StockMovements = () => {
  const dispatch = useDispatch();
  const {
    data: movements = [],
    pagination,
    loading,
    error,
    product,
    codigoBarra,
    stock,
    stock_initial,
    stats
  } = useSelector((state) => state.stockMovements);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    type: '',
    dateFrom: '',
    dateTo: '',
    id_product: ''
  });

  // ✅ DEBUG: Console logs para ver la estructura de datos
  useEffect(() => {
    console.log('🔍 [StockMovements] Estado completo de stockMovements:', {
      data: movements,
      pagination,
      loading,
      error,
      product,
      codigoBarra,
      stock,
      stock_initial,
      stats
    });

    if (movements && movements.length > 0) {
      console.log('🔍 [StockMovements] Primer movimiento completo:', movements[0]);
      console.log('🔍 [StockMovements] Estructura del Product en primer movimiento:', movements[0]?.Product);
      
      // Debug de precios específicos
      movements.slice(0, 3).forEach((movement, index) => {
        console.log(`🔍 [StockMovements] Movimiento ${index + 1} - Precios:`, {
          movement_id: movement.id_movement,
          unit_price: movement.unit_price,
          'Product?.price': movement.Product?.price,
          'Product?.priceSell': movement.Product?.priceSell,
          'Product completo': movement.Product
        });
      });
    }
  }, [movements, pagination, loading, error, product, codigoBarra, stock, stock_initial, stats]);

  // ✅ NUEVA FUNCIÓN: Exportar a Excel con cálculo de ganancias (con más debug)
  const handleExportToExcel = () => {
    console.log('📊 [Excel Export] Iniciando exportación...');
    console.log('📊 [Excel Export] Movements data:', movements);

    if (!movements || movements.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Preparar datos para Excel con cálculo de ganancias
    const excelData = movements.map((movement, index) => {
      // ✅ DEBUG: Log detallado de cada movimiento
      console.log(`📊 [Excel Export] Procesando movimiento ${index + 1}:`, {
        id: movement.id_movement,
        unit_price: movement.unit_price,
        'Product?.price': movement.Product?.price,
        'Product?.priceSell': movement.Product?.priceSell,
        'Product': movement.Product
      });

      // Obtener precios del producto
      const precioCompra = movement.unit_price || movement.Product?.price || 0;
      const precioVenta = movement.Product?.priceSell || 0;
      
      // ✅ DEBUG: Log de precios calculados
      console.log(`📊 [Excel Export] Movimiento ${index + 1} - Precios calculados:`, {
        precioCompra,
        precioVenta,
        'movement.unit_price': movement.unit_price,
        'movement.Product?.price': movement.Product?.price,
        'movement.Product?.priceSell': movement.Product?.priceSell
      });
      
      // Calcular ganancia por unidad y total
      const gananciaPorUnidad = precioVenta - precioCompra;
      const gananciaTotal = gananciaPorUnidad * movement.quantity;
      
      // Calcular margen de ganancia (%)
      const margenGanancia = precioCompra > 0 ? ((gananciaPorUnidad / precioCompra) * 100).toFixed(2) : 0;

      return {
        '#': index + 1,
        'Fecha': formatDate(movement.date),
        'ID_Producto': movement.id_product,
        'Producto': movement.Product?.description || product || movement.id_product,
        'Marca': movement.Product?.marca || '',
        'Código_Barra': movement.Product?.codigoBarra || codigoBarra || '',
        'Tipo_Movimiento': movement.type === 'IN' ? 'Entrada' : 'Salida',
        'Cantidad': movement.quantity,
        'Stock_Actual': movement.Product?.stock || stock || 0,
        'Precio_Compra': precioCompra,
        'Precio_Venta': precioVenta,
        'Ganancia_Por_Unidad': gananciaPorUnidad,
        'Ganancia_Total': gananciaTotal,
        'Margen_Ganancia_%': `${margenGanancia}%`,
        'Motivo': movement.reason || '',
        'Referencia': movement.reference_type 
          ? `${movement.reference_type}${movement.reference_id ? ` (${movement.reference_id})` : ''}` 
          : '',
        'Notas': movement.notes || ''
      };
    });

    console.log('📊 [Excel Export] Datos procesados para Excel:', excelData.slice(0, 2)); // Solo los primeros 2 para no saturar

    // Calcular totales
    const totales = {
      totalEntradas: movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
      totalSalidas: movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0),
      gananciaTotal: excelData.reduce((sum, item) => sum + (item.Ganancia_Total || 0), 0),
      valorInventarioCompra: excelData.reduce((sum, item) => sum + (item.Precio_Compra * item.Cantidad), 0),
      valorInventarioVenta: excelData.reduce((sum, item) => sum + (item.Precio_Venta * item.Cantidad), 0)
    };

    console.log('📊 [Excel Export] Totales calculados:', totales);

    // Agregar fila de totales
    excelData.push({
      '#': '',
      'Fecha': '',
      'ID_Producto': '',
      'Producto': '=== TOTALES ===',
      'Marca': '',
      'Código_Barra': '',
      'Tipo_Movimiento': '',
      'Cantidad': `Entradas: ${totales.totalEntradas} | Salidas: ${totales.totalSalidas}`,
      'Stock_Actual': '',
      'Precio_Compra': '',
      'Precio_Venta': '',
      'Ganancia_Por_Unidad': '',
      'Ganancia_Total': totales.gananciaTotal,
      'Margen_Ganancia_%': '',
      'Motivo': `Valor Inventario (Compra): $${totales.valorInventarioCompra}`,
      'Referencia': `Valor Inventario (Venta): $${totales.valorInventarioVenta}`,
      'Notas': `Ganancia Potencial: $${totales.gananciaTotal}`
    });

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    
    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 5 },   // #
      { wch: 18 },  // Fecha
      { wch: 12 },  // ID_Producto
      { wch: 30 },  // Producto
      { wch: 15 },  // Marca
      { wch: 15 },  // Código_Barra
      { wch: 12 },  // Tipo_Movimiento
      { wch: 10 },  // Cantidad
      { wch: 12 },  // Stock_Actual
      { wch: 12 },  // Precio_Compra
      { wch: 12 },  // Precio_Venta
      { wch: 18 },  // Ganancia_Por_Unidad
      { wch: 15 },  // Ganancia_Total
      { wch: 15 },  // Margen_Ganancia_%
      { wch: 20 },  // Motivo
      { wch: 20 },  // Referencia
      { wch: 30 }   // Notas
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos_Stock');

    // Generar nombre de archivo con filtros aplicados
    const fechaExportacion = new Date().toLocaleDateString('es-CO').replace(/\//g, '-');
    let nombreArchivo = `Movimientos_Stock_${fechaExportacion}`;
    
    if (filters.dateFrom && filters.dateTo) {
      nombreArchivo += `_${filters.dateFrom}_a_${filters.dateTo}`;
    } else if (filters.dateFrom) {
      nombreArchivo += `_desde_${filters.dateFrom}`;
    } else if (filters.dateTo) {
      nombreArchivo += `_hasta_${filters.dateTo}`;
    }
    
    if (filters.type) {
      nombreArchivo += `_${filters.type}`;
    }
    
    if (filters.id_product) {
      nombreArchivo += `_${filters.id_product}`;
    }

    // Descargar archivo
    XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
    
    // Mostrar resumen
    alert(`📊 Excel exportado exitosamente!\n\n` +
          `📄 Registros: ${movements.length}\n` +
          `📈 Entradas: ${totales.totalEntradas}\n` +
          `📉 Salidas: ${totales.totalSalidas}\n` +
          `💰 Ganancia Total: $${totales.gananciaTotal.toLocaleString('es-CO')}\n` +
          `📁 Archivo: ${nombreArchivo}.xlsx`);
  };

  useEffect(() => {
    console.log('🚀 [StockMovements] Componente montado, cargando datos iniciales...');
    dispatch(fetchStockMovements(filters));
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (field, value) => {
    console.log(`🔄 [StockMovements] Cambiando filtro ${field} a:`, value);
    const newFilters = { ...filters, [field]: value, page: 1 };
    setFilters(newFilters);
    console.log('🔄 [StockMovements] Nuevos filtros:', newFilters);
    dispatch(fetchStockMovements(newFilters));
  };

  const handlePageChange = (newPage) => {
    console.log('📄 [StockMovements] Cambiando a página:', newPage);
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    dispatch(fetchStockMovements(newFilters));
  };

  const resetFilters = () => {
    console.log('🔄 [StockMovements] Reseteando filtros...');
    const newFilters = {
      page: 1,
      limit: 50,
      type: '',
      dateFrom: '',
      dateTo: '',
      id_product: ''
    };
    setFilters(newFilters);
    dispatch(fetchStockMovements(newFilters));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ DEBUG: Log cuando cambia el loading state
  useEffect(() => {
    console.log('⏳ [StockMovements] Loading state cambió:', loading);
  }, [loading]);

  if (loading && movements.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando movimientos de stock...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ [StockMovements] Error:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error al cargar movimientos
          </h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => dispatch(fetchStockMovements(filters))}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📦 Movimientos de Stock
      </h1>

      {/* Estadísticas generales */}
      {stats && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
          <p className="text-sm text-green-800">
            <strong>Entradas totales:</strong> {stats.totalIn} &nbsp;|&nbsp;
            <strong>Salidas totales:</strong> {stats.totalOut} &nbsp;|&nbsp;
            <strong>Movimientos:</strong> {stats.movementsCount} &nbsp;|&nbsp;
            <strong>Último movimiento:</strong> {stats.lastMovementDate ? formatDate(stats.lastMovementDate) : 'N/A'}
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          🔍 Filtros de Búsqueda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📊 Tipo de Movimiento
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los Movimientos</option>
              <option value="IN">Entradas (IN)</option>
              <option value="OUT">Salidas (OUT)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Fecha Desde
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Fecha Hasta
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔎 ID Producto
            </label>
            <input
              type="text"
              value={filters.id_product}
              onChange={(e) => handleFilterChange('id_product', e.target.value)}
              placeholder="Ej: B001"
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
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
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
            onClick={() => dispatch(fetchStockMovements(filters))}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            disabled={loading}
          >
            {loading ? '🔄 Cargando...' : '🔍 Buscar'}
          </button>
          {/* ✅ BOTÓN: Exportar a Excel */}
          <button
            onClick={handleExportToExcel}
            disabled={!movements || movements.length === 0 || loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            📊 Exportar Excel ({movements?.length || 0} registros)
          </button>
        </div>
      </div>

      {/* Información de Paginación */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <p className="text-sm text-blue-800">
          <strong>📊 Resultados:</strong> Mostrando {movements.length} de {pagination?.total || 0} movimientos
          {pagination?.totalPages > 1 && (
            <span className="ml-2">
              (Página {pagination.page} de {pagination.totalPages})
            </span>
          )}
        </p>
      </div>

      {/* Tabla de Movimientos */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">📅 Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">📦 Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">📊 Tipo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">🔢 Cantidad</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">📊 Stock Actual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">📝 Motivo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🔗 Referencia</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">💲 Unitario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🗒️ Notas</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {movements.length > 0 ? (
              movements.map((movement) => (
                <tr
                  key={movement.id_movement}
                  className={`transition-colors duration-200 ${
                    movement.type === 'IN' ? "hover:bg-green-50" : "hover:bg-red-50"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(movement.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div>
                      <div className="font-medium">{movement.Product?.description || product || movement.id_product}</div>
                      <div className="text-gray-500">
                        {movement.Product?.marca || ''} {movement.Product?.codigoBarra || codigoBarra || ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        movement.type === 'IN'
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {movement.type === 'IN' ? '📈 Entrada' : '📉 Salida'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                    movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                    {movement.Product?.stock || stock || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {movement.reason || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {movement.reference_type
                      ? `${movement.reference_type}${movement.reference_id ? ` (${movement.reference_id})` : ''}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {movement.unit_price != null ? `$${movement.unit_price}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <TruncatedText text={movement.notes} maxLength={30} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>No hay movimientos de stock para mostrar</p>
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

        {/* ...resto de la paginación sin cambios... */}
        {pagination?.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ← Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
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
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  a{" "}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{" "}
                  de <span className="font-medium">{pagination.total}</span>{" "}
                  resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1 || loading}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {"<<"}
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {"<"}
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || loading}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {">"}
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages || loading}
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
    </div>
  );
};

export default StockMovements;