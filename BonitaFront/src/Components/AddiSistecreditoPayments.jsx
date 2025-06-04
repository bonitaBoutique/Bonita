import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { BASE_URL } from "../Config"; // ✅ Importa BASE_URL desde tu archivo de configuración

const AddiSistecreditoPayments = () => {
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [totals, setTotals] = useState({
    pending: 0,
    deposited: 0,
    total: 0
  });

  // ✅ Cargar pagos usando axios
  const fetchPayments = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page.toString(),
        limit: '20',
        ...filters
      };

      // ✅ Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      console.log("📤 Enviando petición:", `${BASE_URL}/payments/addi-sistecredito`, params);

      const response = await axios.get(`${BASE_URL}/payments/addi-sistecredito`, {
        params
      });

      console.log("📥 Respuesta recibida:", response.data);

      if (response.data.success) {
        setPayments(response.data.data.receipts);
        setPagination(response.data.data.pagination);
        setTotals(response.data.data.totals);
      } else {
        throw new Error(response.data.message || 'Error al cargar los datos');
      }
    } catch (error) {
      console.error("❌ Error al cargar pagos:", error);
      
      // ✅ Manejo de errores más específico
      if (error.response) {
        // Error del servidor (4xx, 5xx)
        setError(`Error del servidor: ${error.response.data?.message || error.response.status}`);
      } else if (error.request) {
        // Error de red
        setError("Error de conexión. Verifica tu conexión a internet.");
      } else {
        // Otro tipo de error
        setError(error.message || "Error desconocido");
      }
      
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Actualizar depósito usando axios
  const updateDeposit = async (receiptId, depositData) => {
    try {
      console.log("🔄 Actualizando depósito:", receiptId, depositData);

      const response = await axios.put(`${BASE_URL}/payments/deposit/${receiptId}`, depositData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("✅ Respuesta actualización:", response.data);

      if (response.data.success) {
        // ✅ Recargar datos
        await fetchPayments(pagination.currentPage);
        alert("✅ Depósito actualizado exitosamente");
      } else {
        throw new Error(response.data.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error("❌ Error al actualizar depósito:", error);
      
      // ✅ Manejo de errores específico
      if (error.response) {
        alert(`❌ Error: ${error.response.data?.message || error.response.status}`);
      } else if (error.request) {
        alert("❌ Error de conexión al actualizar el depósito");
      } else {
        alert(`❌ Error al actualizar: ${error.message}`);
      }
    }
  };

  // ✅ Componente para fila de pago
  const PaymentRow = ({ payment }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
      depositDate: payment.depositDate ? dayjs(payment.depositDate).format('YYYY-MM-DD') : '',
      depositAmount: payment.depositAmount || payment.totalAmount,
      notes: payment.depositNotes || ''
    });

    const handleSave = async () => {
      await updateDeposit(payment.id, editData);
      setIsEditing(false);
    };

    const handleRemoveDeposit = async () => {
      if (window.confirm("⚠️ ¿Seguro que quieres remover este depósito?")) {
        await updateDeposit(payment.id, { 
          depositDate: null, 
          depositAmount: null, 
          notes: null 
        });
      }
    };

    return (
      <tr className={`${payment.depositDate ? 'bg-green-50' : 'bg-yellow-50'} hover:bg-gray-100 transition-colors`}>
        <td className="px-4 py-3 text-sm">
          {dayjs(payment.date).format('DD/MM/YYYY HH:mm')}
        </td>
        <td className="px-4 py-3 text-sm">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            payment.paymentMethod === 'Addi' 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {payment.paymentMethod}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-medium">
          ${parseFloat(payment.totalAmount || 0).toLocaleString('es-CO')}
        </td>
        <td className="px-4 py-3 text-sm">
          {payment.buyerName || payment.customerName || 'N/A'}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <input
              type="date"
              value={editData.depositDate}
              onChange={(e) => setEditData({...editData, depositDate: e.target.value})}
              className="border rounded px-2 py-1 text-xs w-full focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            payment.depositDate ? (
              <span className="text-green-600 font-medium">
                {dayjs(payment.depositDate).format('DD/MM/YYYY')}
              </span>
            ) : (
              <span className="text-red-500 text-xs font-medium">⏳ Pendiente</span>
            )
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <input
              type="number"
              value={editData.depositAmount}
              onChange={(e) => setEditData({...editData, depositAmount: e.target.value})}
              className="border rounded px-2 py-1 text-xs w-full focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min="0"
            />
          ) : (
            payment.depositAmount ? (
              <span className="text-green-600 font-medium">
                ${parseFloat(payment.depositAmount).toLocaleString('es-CO')}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition duration-200"
                title="Guardar"
              >
                ✓
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition duration-200"
                title="Cancelar"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition duration-200"
                title="Editar"
              >
                ✏️
              </button>
              {payment.depositDate && (
                <button
                  onClick={handleRemoveDeposit}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition duration-200"
                  title="Remover depósito"
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </td>
      </tr>
    );
  };

  // ✅ Función para resetear filtros
  const resetFilters = () => {
    setFilters({
      status: 'all',
      paymentMethod: 'all',
      startDate: '',
      endDate: ''
    });
  };

  // ✅ Efecto para cargar datos cuando cambian los filtros
  useEffect(() => {
    fetchPayments();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
      {/* ✅ Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          💳 Pagos Addi & Sistecredito
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
        >
          ← Volver
        </button>
      </div>

      {/* ✅ Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar los datos</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <div className="mt-3">
                <button
                  onClick={() => fetchPayments()}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition duration-200"
                >
                  🔄 Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yellow-800">Pendientes</h3>
              <p className="text-2xl font-bold text-yellow-900">
                ${totals.pending.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-green-800">Depositados</h3>
              <p className="text-2xl font-bold text-green-900">
                ${totals.deposited.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-blue-800">Total</h3>
              <p className="text-2xl font-bold text-blue-900">
                ${totals.total.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">🔍 Filtros</h2>
          <button
            onClick={resetFilters}
            className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition duration-200"
          >
            🔄 Limpiar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">⏳ Pendientes</option>
              <option value="deposited">✅ Depositados</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
              className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los métodos</option>
              <option value="Addi">🛒 Solo Addi</option>
              <option value="Sistecredito">💰 Solo Sistecredito</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ✅ Tabla */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            📋 Lista de Pagos 
            {!loading && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({pagination.total} registros)
              </span>
            )}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  📅 Fecha Venta
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  💳 Método
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  💰 Monto Venta
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  👤 Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  📅 Fecha Depósito
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  💵 Monto Depositado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ⚙️ Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                      <p className="text-gray-500">Cargando pagos...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    <div className="text-red-500">
                      <p className="text-lg">❌ Error al cargar los datos</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg">📭 No hay pagos</p>
                      <p className="text-sm mt-1">No se encontraron pagos de Addi o Sistecredito con los filtros seleccionados</p>
                      <button
                        onClick={resetFilters}
                        className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        🔄 Limpiar filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <PaymentRow key={payment.id} payment={payment} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Paginación */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Mostrando página {pagination.currentPage} de {pagination.totalPages} 
              <span className="hidden sm:inline">
                {" "}({pagination.total} registros total)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchPayments(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition duration-200"
              >
                ← Anterior
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchPayments(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition duration-200"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddiSistecreditoPayments;