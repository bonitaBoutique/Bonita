import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentIntents } from '../../Redux/Actions/actions';
import { formatCurrency } from '../../formatCurrency';
import Navbar from '../Navbar';
import * as XLSX from 'xlsx';

const PaymentIntentsList = () => {
  const dispatch = useDispatch();
  const {
    data: paymentIntents = [],
    pagination,
    loading,
    error,
    filters: storedFilters,
    lastUpdated
  } = useSelector((state) => state.paymentIntents);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 5, // ✅ Cambio de 20 a 5 resultados por página
    status: '',
    search: '',
    fromDate: '',
    toDate: ''
  });

  const [autoRefresh, setAutoRefresh] = useState(true); // ✅ Auto-refresh activado por defecto
  const [refreshInterval, setRefreshInterval] = useState(30); // ✅ Intervalo en segundos
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  
  // Estados para tooltip de productos
  const [hoveredPaymentId, setHoveredPaymentId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // ✅ NUEVO: Función para refrescar datos
  const refreshData = () => {
    console.log('🔄 [PaymentIntents] Refrescando datos...');
    dispatch(fetchPaymentIntents(filters));
    setLastRefreshTime(Date.now());
  };

  // Cargar datos iniciales
  useEffect(() => {
    console.log('🚀 [PaymentIntents] Componente montado, cargando datos iniciales...');
    refreshData();
  }, []);

  // ✅ NUEVO: Auto-refresh periódico
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      console.log(`🔄 [PaymentIntents] Auto-refresh cada ${refreshInterval} segundos`);
      refreshData();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, filters]);

  // Debug de estado
  useEffect(() => {
    console.log('🔍 [PaymentIntents] Estado completo:', {
      paymentIntents,
      pagination,
      loading,
      error,
      filters,
      storedFilters,
      lastUpdated
    });
  }, [paymentIntents, pagination, loading, error, filters, storedFilters, lastUpdated]);

  const handleFilterChange = (field, value) => {
    console.log(`🔄 [PaymentIntents] Cambiando filtro ${field} a:`, value);
    const newFilters = { ...filters, [field]: value, page: 1 };
    setFilters(newFilters);
    console.log('🔄 [PaymentIntents] Nuevos filtros:', newFilters);
    dispatch(fetchPaymentIntents(newFilters));
  };

  const handlePageChange = (newPage) => {
    console.log('📄 [PaymentIntents] Cambiando a página:', newPage);
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    dispatch(fetchPaymentIntents(newFilters));
  };

  const resetFilters = () => {
    console.log('🔄 [PaymentIntents] Reseteando filtros...');
    const newFilters = {
      page: 1,
      limit: 5, // ✅ Cambio de 20 a 5 resultados por página
      status: '',
      search: '',
      fromDate: '',
      toDate: ''
    };
    setFilters(newFilters);
    dispatch(fetchPaymentIntents(newFilters));
  };

  const getStatusColor = (status) => {
    const statusColors = {
      APPROVED: 'bg-green-100 text-green-800',
      DECLINED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      VOIDED: 'bg-gray-100 text-gray-800',
      ERROR: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      APPROVED: '✅',
      DECLINED: '❌',
      PENDING: '⏳',
      VOIDED: '🚫',
      ERROR: '⚠️'
    };
    return statusIcons[status] || '❓';
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

  const formatAmount = (amountInCents) => {
    const amount = amountInCents / 100;
    return formatCurrency(amount);
  };

  // Funciones para manejo del tooltip de productos
  const handleMouseEnter = (paymentId, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY + 5,
    });
    setHoveredPaymentId(paymentId);
  };

  const handleMouseLeave = () => {
    setHoveredPaymentId(null);
  };

  const handleExportToExcel = () => {
    console.log('📊 [Excel Export] Iniciando exportación de pagos en línea...');
    
    if (!paymentIntents || paymentIntents.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Preparar datos para Excel
    const excelData = paymentIntents.map((payment, index) => {
      const amount = payment.amount_in_cents / 100;
      const shippingCost = payment.shipping_cost || 0;
      const discount = payment.discount || 0;
      const total = amount + shippingCost - discount;

      return {
        '#': index + 1,
        'Fecha': formatDate(payment.createdAt),
        'Referencia': payment.order_reference,
        'Referencia_Wompi': payment.wompi_reference,
        'Estado': payment.status,
        'Cliente_Documento': payment.customer_document,
        'Cliente_Nombre': payment.customer_name,
        'Cliente_Email': payment.customer_email,
        'Monto_Base': amount,
        'Descuento': discount,
        'Envío': shippingCost,
        'Total': total,
        'Moneda': payment.currency,
        'Dirección': payment.address_type,
        'Dirección_Entrega': payment.delivery_address,
        'Productos_Cantidad': payment.products?.length || 0,
        'Wompi_Transaction_ID': payment.wompi_transaction_id || 'N/A',
        'Order_Detail_ID': payment.order_detail_id || 'N/A',
        'Actualizado': formatDate(payment.updatedAt)
      };
    });

    // Calcular estadísticas
    const stats = {
      total: paymentIntents.length,
      approved: paymentIntents.filter(p => p.status === 'APPROVED').length,
      pending: paymentIntents.filter(p => p.status === 'PENDING').length,
      declined: paymentIntents.filter(p => p.status === 'DECLINED').length,
      totalAmount: paymentIntents.reduce((sum, p) => sum + (p.amount_in_cents / 100), 0),
      approvedAmount: paymentIntents
        .filter(p => p.status === 'APPROVED')
        .reduce((sum, p) => sum + (p.amount_in_cents / 100), 0)
    };

    // Agregar fila de estadísticas
    excelData.push({
      '#': '',
      'Fecha': '',
      'Referencia': '=== ESTADÍSTICAS ===',
      'Referencia_Wompi': '',
      'Estado': `Total: ${stats.total} | Aprobados: ${stats.approved} | Pendientes: ${stats.pending} | Rechazados: ${stats.declined}`,
      'Cliente_Documento': '',
      'Cliente_Nombre': '',
      'Cliente_Email': '',
      'Monto_Base': '',
      'Descuento': '',
      'Envío': '',
      'Total': `Total General: $${stats.totalAmount.toLocaleString('es-CO')} | Aprobado: $${stats.approvedAmount.toLocaleString('es-CO')}`,
      'Moneda': '',
      'Dirección': '',
      'Dirección_Entrega': '',
      'Productos_Cantidad': '',
      'Wompi_Transaction_ID': '',
      'Order_Detail_ID': '',
      'Actualizado': ''
    });

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    
    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 5 },   // #
      { wch: 18 },  // Fecha
      { wch: 25 },  // Referencia
      { wch: 25 },  // Referencia_Wompi
      { wch: 12 },  // Estado
      { wch: 15 },  // Cliente_Documento
      { wch: 25 },  // Cliente_Nombre
      { wch: 30 },  // Cliente_Email
      { wch: 15 },  // Monto_Base
      { wch: 12 },  // Descuento
      { wch: 12 },  // Envío
      { wch: 15 },  // Total
      { wch: 10 },  // Moneda
      { wch: 20 },  // Dirección
      { wch: 30 },  // Dirección_Entrega
      { wch: 15 },  // Productos_Cantidad
      { wch: 20 },  // Wompi_Transaction_ID
      { wch: 15 },  // Order_Detail_ID
      { wch: 18 }   // Actualizado
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos_Online');

    // Generar nombre de archivo
    const fechaExportacion = new Date().toLocaleDateString('es-CO').replace(/\//g, '-');
    let nombreArchivo = `Pagos_Online_${fechaExportacion}`;
    
    if (filters.fromDate && filters.toDate) {
      nombreArchivo += `_${filters.fromDate}_a_${filters.toDate}`;
    } else if (filters.fromDate) {
      nombreArchivo += `_desde_${filters.fromDate}`;
    } else if (filters.toDate) {
      nombreArchivo += `_hasta_${filters.toDate}`;
    }
    
    if (filters.status) {
      nombreArchivo += `_${filters.status}`;
    }

    // Descargar archivo
    XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
    
    // Mostrar resumen
    alert(`📊 Excel exportado exitosamente!\n\n` +
          `📄 Registros: ${stats.total}\n` +
          `✅ Aprobados: ${stats.approved}\n` +
          `⏳ Pendientes: ${stats.pending}\n` +
          `❌ Rechazados: ${stats.declined}\n` +
          `💰 Monto Total: ${formatCurrency(stats.totalAmount)}\n` +
          `💚 Monto Aprobado: ${formatCurrency(stats.approvedAmount)}\n` +
          `📁 Archivo: ${nombreArchivo}.xlsx`);
  };

  if (loading && paymentIntents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando pagos en línea...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ [PaymentIntents] Error:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Error al cargar pagos en línea
            </h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => dispatch(fetchPaymentIntents(filters))}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              💳 Pagos en Línea
            </h1>
            {/* ✅ NUEVO: Indicador de última actualización */}
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {new Date(lastRefreshTime).toLocaleTimeString('es-CO')}
              {autoRefresh && ` • Auto-refresh cada ${refreshInterval}s`}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {/* ✅ NUEVO: Toggle Auto-refresh */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Auto-refresh
                </span>
              </label>
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border-l border-gray-300 pl-2 focus:outline-none"
                >
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1min</option>
                  <option value={120}>2min</option>
                </select>
              )}
            </div>

            <button
              onClick={handleExportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
              disabled={paymentIntents.length === 0}
            >
              📊 Exportar Excel
            </button>
            <button
              onClick={refreshData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  🔄 Actualizar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {pagination && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-blue-600 text-sm font-medium">Total Registros</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                </div>
                <div className="text-blue-500 text-2xl">📊</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-green-600 text-sm font-medium">Aprobados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {paymentIntents.filter(p => p.status === 'APPROVED').length}
                  </p>
                </div>
                <div className="text-green-500 text-2xl">✅</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {paymentIntents.filter(p => p.status === 'PENDING').length}
                  </p>
                </div>
                <div className="text-yellow-500 text-2xl">⏳</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-red-600 text-sm font-medium">Rechazados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {paymentIntents.filter(p => p.status === 'DECLINED').length}
                  </p>
                </div>
                <div className="text-red-500 text-2xl">❌</div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            🔍 Filtros de Búsqueda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📊 Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los Estados</option>
                <option value="APPROVED">✅ Aprobado</option>
                <option value="PENDING">⏳ Pendiente</option>
                <option value="DECLINED">❌ Rechazado</option>
                <option value="VOIDED">🚫 Anulado</option>
                <option value="ERROR">⚠️ Error</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔎 Buscar
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Referencia, documento, email, nombre..."
                className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Fecha Desde
              </label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Fecha Hasta
              </label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📄 Por Página
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="5">5 por página</option>
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
                <option value="100">100 por página</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={resetFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
            >
              🔄 Resetear Filtros
            </button>
            <button
              onClick={() => dispatch(fetchPaymentIntents(filters))}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
              disabled={loading}
            >
              {loading ? '🔄 Cargando...' : '🔍 Buscar'}
            </button>
          </div>

          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              📅 Última actualización: {formatDate(lastUpdated)}
            </p>
          )}
        </div>

        {/* Lista de Pagos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {paymentIntents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron pagos en línea
              </h3>
              <p className="text-gray-500">
                {filters.status || filters.search || filters.fromDate || filters.toDate
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no hay pagos en línea registrados en el sistema'}
              </p>
            </div>
          ) : (
            <>
              {/* Tabla para pantallas grandes */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha & Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referencias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto & Productos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dirección
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paymentIntents.map((payment, index) => (
                      <tr key={payment.id_payment_intent} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              {formatDate(payment.createdAt)}
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {getStatusIcon(payment.status)} {payment.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-gray-900">
                              {payment.order_reference}
                            </div>
                            <div className="text-gray-500 text-xs">
                              Wompi: {payment.wompi_reference}
                            </div>
                            {payment.wompi_transaction_id && (
                              <div className="text-gray-500 text-xs">
                                TX: {payment.wompi_transaction_id}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-gray-900">
                              {payment.customer_name || 'N/A'}
                            </div>
                            <div className="text-gray-500">
                              {payment.customer_document}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {payment.customer_email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div 
                            className="space-y-1 text-sm cursor-pointer hover:bg-gray-50 rounded p-1 transition-colors"
                            onMouseEnter={(e) => handleMouseEnter(payment.id_payment_intent, e)}
                            onMouseLeave={handleMouseLeave}
                          >
                            <div className="font-medium text-gray-900">
                              {formatAmount(payment.amount_in_cents)}
                            </div>
                            <div className="text-blue-600 text-xs hover:underline">
                              {payment.products?.length || 0} producto{payment.products?.length !== 1 ? 's' : ''} →
                            </div>
                            {(payment.discount > 0 || payment.shipping_cost > 0) && (
                              <div className="text-gray-500 text-xs">
                                {payment.discount > 0 && `Desc: ${formatCurrency(payment.discount)} `}
                                {payment.shipping_cost > 0 && `Envío: ${formatCurrency(payment.shipping_cost)}`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <div className="text-gray-900">
                              {payment.address_type}
                            </div>
                            {payment.delivery_address && (
                              <div className="text-gray-500 text-xs">
                                {payment.delivery_address.length > 50 
                                  ? `${payment.delivery_address.substring(0, 50)}...`
                                  : payment.delivery_address}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tarjetas para pantallas pequeñas */}
              <div className="lg:hidden space-y-4 p-4">
                {paymentIntents.map((payment, index) => (
                  <div key={payment.id_payment_intent} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment.customer_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.customer_document}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)} {payment.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monto:</span>
                        <span className="font-medium">{formatAmount(payment.amount_in_cents)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Productos:</span>
                        <span>{payment.products?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fecha:</span>
                        <span>{formatDate(payment.createdAt)}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-gray-500">Referencia:</div>
                        <div className="text-xs font-mono bg-gray-100 p-1 rounded">
                          {payment.order_reference}
                        </div>
                      </div>
                      {payment.delivery_address && (
                        <div className="space-y-1">
                          <div className="text-gray-500">Dirección:</div>
                          <div className="text-xs">{payment.delivery_address}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-700">
                      Mostrando página <span className="font-medium">{pagination.page}</span> de{' '}
                      <span className="font-medium">{pagination.totalPages}</span>
                      {' '}({pagination.total} registros total)
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tooltip de productos */}
      {hoveredPaymentId && (
        <div
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md"
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
          }}
        >
          <div className="space-y-2">
            <div className="font-semibold text-gray-900 border-b pb-2">
              Productos del pedido:
            </div>
            {paymentIntents
              .find(p => p.id_payment_intent === hoveredPaymentId)
              ?.products?.map((product, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4 py-1 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {product.description || product.id_product}
                    </div>
                    {product.id_product && (
                      <div className="text-xs text-gray-500">
                        Código: {product.id_product}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {product.quantity} x {formatCurrency(product.price)}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold">
                      = {formatCurrency(product.price * product.quantity)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentIntentsList;