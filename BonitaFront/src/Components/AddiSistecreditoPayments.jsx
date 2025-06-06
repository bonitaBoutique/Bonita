import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { BASE_URL } from "../Config";

const AddiSistecreditoPayments = () => {
  const navigate = useNavigate();
  
  const [deposits, setDeposits] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('conciliation'); // 'conciliation', 'deposits', 'register'
  const [filters, setFilters] = useState({
    platform: 'all',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [summary, setSummary] = useState({
    deposits: { totalAmount: 0, count: 0 },
    receipts: { totalAmount: 0, count: 0 },
    difference: { total: 0 }
  });

  // ✅ NUEVA FUNCIÓN: Obtener conciliación
  const fetchConciliation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        ...filters
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      console.log("📤 Obteniendo conciliación:", `${BASE_URL}/addi-sistecredito/conciliation`, params);

      const response = await axios.get(`${BASE_URL}/addi-sistecredito/conciliation`, {
        params
      });

      console.log("📥 Conciliación recibida:", response.data);

      if (response.data.success) {
        setSummary(response.data.data.summary);
        setDeposits(response.data.data.deposits);
        setReceipts(response.data.data.receipts);
      } else {
        throw new Error(response.data.message || 'Error al cargar la conciliación');
      }
    } catch (error) {
      console.error("❌ Error al cargar conciliación:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Obtener lista de depósitos
  const fetchDeposits = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page.toString(),
        limit: '20',
        ...filters
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      console.log("📤 Obteniendo depósitos:", `${BASE_URL}/addi-sistecredito/deposits`, params);

      const response = await axios.get(`${BASE_URL}/addi-sistecredito/deposits`, {
        params
      });

      if (response.data.success) {
        setDeposits(response.data.data.deposits);
        setPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.message || 'Error al cargar los depósitos');
      }
    } catch (error) {
      console.error("❌ Error al cargar depósitos:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Registrar depósito
  const registerDeposit = async (depositData) => {
    try {
      console.log("💰 Registrando depósito:", depositData);

      const response = await axios.post(`${BASE_URL}/addi-sistecredito/deposit`, depositData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("✅ Depósito registrado:", response.data);

      if (response.data.success) {
        alert("✅ Depósito registrado exitosamente");
        // Recargar datos según la pestaña activa
        if (activeTab === 'conciliation') {
          await fetchConciliation();
        } else if (activeTab === 'deposits') {
          await fetchDeposits();
        }
        return true;
      } else {
        throw new Error(response.data.message || 'Error al registrar');
      }
    } catch (error) {
      console.error("❌ Error al registrar depósito:", error);
      handleError(error);
      return false;
    }
  };

  // ✅ NUEVA FUNCIÓN: Actualizar depósito
  const updateDeposit = async (depositId, updateData) => {
    try {
      console.log("🔄 Actualizando depósito:", depositId, updateData);

      const response = await axios.put(`${BASE_URL}/addi-sistecredito/deposit/${depositId}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.success) {
        alert("✅ Depósito actualizado exitosamente");
        // Recargar datos
        if (activeTab === 'conciliation') {
          await fetchConciliation();
        } else if (activeTab === 'deposits') {
          await fetchDeposits();
        }
      } else {
        throw new Error(response.data.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error("❌ Error al actualizar depósito:", error);
      handleError(error);
    }
  };

  // ✅ Manejo de errores centralizado
  const handleError = (error) => {
    if (error.response) {
      setError(`Error del servidor: ${error.response.data?.message || error.response.status}`);
    } else if (error.request) {
      setError("Error de conexión. Verifica tu conexión a internet.");
    } else {
      setError(error.message || "Error desconocido");
    }
  };

  // ✅ COMPONENTE: Formulario de registro
  const RegisterDepositForm = () => {
    const [formData, setFormData] = useState({
      platform: 'Addi',
      depositDate: dayjs().format('YYYY-MM-DD'),
      amount: '',
      referenceNumber: '',
      description: '',
      registeredBy: '', // Aquí deberías obtener el usuario actual
      notes: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.amount || !formData.registeredBy) {
        alert("❌ Por favor completa los campos obligatorios");
        return;
      }

      const success = await registerDeposit({
        ...formData,
        amount: parseFloat(formData.amount)
      });

      if (success) {
        // Limpiar formulario
        setFormData({
          platform: 'Addi',
          depositDate: dayjs().format('YYYY-MM-DD'),
          amount: '',
          referenceNumber: '',
          description: '',
          registeredBy: formData.registeredBy, // Mantener usuario
          notes: ''
        });
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">💰 Registrar Nuevo Depósito</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plataforma *
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Addi">🛒 Addi</option>
                <option value="Sistecredito">💰 Sistecredito</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Depósito *
              </label>
              <input
                type="date"
                value={formData.depositDate}
                onChange={(e) => setFormData({...formData, depositDate: e.target.value})}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Referencia
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                placeholder="REF123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registrado por *
              </label>
              <input
                type="text"
                value={formData.registeredBy}
                onChange={(e) => setFormData({...formData, registeredBy: e.target.value})}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                placeholder="Documento del usuario"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                placeholder="Depósito semanal, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Notas adicionales..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              💰 Registrar Depósito
            </button>
          </div>
        </form>
      </div>
    );
  };

  // ✅ Función para resetear filtros
  const resetFilters = () => {
    setFilters({
      platform: 'all',
      startDate: '',
      endDate: ''
    });
  };

  // ✅ Efecto para cargar datos cuando cambian filtros o pestaña
  useEffect(() => {
    if (activeTab === 'conciliation') {
      fetchConciliation();
    } else if (activeTab === 'deposits') {
      fetchDeposits();
    }
  }, [filters, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
      {/* ✅ Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          💳 Gestión Addi & Sistecredito
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
        >
          ← Volver
        </button>
      </div>

      {/* ✅ Pestañas */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'conciliation', label: '📊 Conciliación', icon: '📊' },
          { id: 'deposits', label: '💰 Depósitos', icon: '💰' },
          { id: 'register', label: '➕ Registrar', icon: '➕' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ✅ Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <div className="mt-3">
                <button
                  onClick={() => {
                    if (activeTab === 'conciliation') fetchConciliation();
                    else if (activeTab === 'deposits') fetchDeposits();
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition duration-200"
                >
                  🔄 Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Contenido según pestaña activa */}
      {activeTab === 'register' && <RegisterDepositForm />}

      {activeTab === 'conciliation' && (
        <div>
          {/* Resumen de conciliación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-green-800">💰 Depósitos Registrados</h3>
              <p className="text-2xl font-bold text-green-900">
                ${summary.deposits.totalAmount.toLocaleString('es-CO')}
              </p>
              <p className="text-sm text-green-700">{summary.deposits.count} depósitos</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-blue-800">🧾 Recibos Generados</h3>
              <p className="text-2xl font-bold text-blue-900">
                ${summary.receipts.totalAmount.toLocaleString('es-CO')}
              </p>
              <p className="text-sm text-blue-700">{summary.receipts.count} recibos</p>
            </div>
            <div className={`p-4 rounded-lg border-l-4 ${
              summary.difference.total >= 0 
                ? 'bg-green-100 border-green-500' 
                : 'bg-red-100 border-red-500'
            }`}>
              <h3 className={`text-lg font-semibold ${
                summary.difference.total >= 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                ⚖️ Diferencia
              </h3>
              <p className={`text-2xl font-bold ${
                summary.difference.total >= 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                ${Math.abs(summary.difference.total).toLocaleString('es-CO')}
              </p>
              <p className={`text-sm ${
                summary.difference.total >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {summary.difference.total >= 0 ? 'Favor' : 'Déficit'}
              </p>
            </div>
          </div>

          {/* Filtros para conciliación */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
                <select
                  value={filters.platform}
                  onChange={(e) => setFilters({...filters, platform: e.target.value})}
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas las plataformas</option>
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
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Mostrar depósitos y recibos lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Depósitos */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-green-50 border-b">
                <h3 className="text-lg font-medium text-green-900">💰 Depósitos Registrados</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {deposits.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    📭 No hay depósitos registrados
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {deposits.map((deposit) => (
                      <div key={deposit.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                deposit.platform === 'Addi' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {deposit.platform}
                              </span>
                              <span className="text-sm text-gray-500">
                                {dayjs(deposit.depositDate).format('DD/MM/YYYY')}
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-green-600">
                              ${deposit.amount.toLocaleString('es-CO')}
                            </p>
                            {deposit.description && (
                              <p className="text-sm text-gray-600">{deposit.description}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            deposit.status === 'Registrado' ? 'bg-yellow-100 text-yellow-800' :
                            deposit.status === 'Conciliado' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {deposit.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recibos */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-blue-50 border-b">
                <h3 className="text-lg font-medium text-blue-900">🧾 Recibos Generados</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {receipts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    📭 No hay recibos generados
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {receipts.map((receipt) => (
                      <div key={receipt.id_receipt} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                receipt.payMethod === 'Addi' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {receipt.payMethod}
                              </span>
                              <span className="text-sm text-gray-500">
                                {dayjs(receipt.date).format('DD/MM/YYYY')}
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-blue-600">
                              ${receipt.total_amount.toLocaleString('es-CO')}
                            </p>
                            <p className="text-sm text-gray-600">{receipt.buyer_name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deposits' && (
        <div>
          {/* Lista de depósitos con funcionalidad de edición */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                💰 Gestión de Depósitos
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      📅 Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      💳 Plataforma
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      💰 Monto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      📝 Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ⚙️ Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                          <p className="text-gray-500">Cargando depósitos...</p>
                        </div>
                      </td>
                    </tr>
                  ) : deposits.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center">
                        <div className="text-gray-500">
                          <p className="text-lg">📭 No hay depósitos</p>
                          <p className="text-sm mt-1">No se encontraron depósitos con los filtros seleccionados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    deposits.map((deposit) => (
                      <DepositRow 
                        key={deposit.id} 
                        deposit={deposit} 
                        onUpdate={updateDeposit}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Página {pagination.currentPage} de {pagination.totalPages} 
                  ({pagination.total} registros)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchDeposits(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => fetchDeposits(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ COMPONENTE: Fila de depósito editable
const DepositRow = ({ deposit, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: deposit.status,
    notes: deposit.notes || '',
    description: deposit.description || '',
    referenceNumber: deposit.referenceNumber || ''
  });

  const handleSave = async () => {
    await onUpdate(deposit.id, editData);
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-gray-100 transition-colors">
      <td className="px-4 py-3 text-sm">
        {dayjs(deposit.depositDate).format('DD/MM/YYYY')}
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          deposit.platform === 'Addi' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {deposit.platform}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-medium">
        ${deposit.amount.toLocaleString('es-CO')}
      </td>
      <td className="px-4 py-3 text-sm">
        {isEditing ? (
          <select
            value={editData.status}
            onChange={(e) => setEditData({...editData, status: e.target.value})}
            className="border rounded px-2 py-1 text-xs w-full focus:ring-2 focus:ring-blue-500"
          >
            <option value="Registrado">Registrado</option>
            <option value="Conciliado">Conciliado</option>
            <option value="Revisión">Revisión</option>
          </select>
        ) : (
          <span className={`px-2 py-1 rounded text-xs ${
            deposit.status === 'Registrado' ? 'bg-yellow-100 text-yellow-800' :
            deposit.status === 'Conciliado' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {deposit.status}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        {isEditing ? (
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
              title="Guardar"
            >
              ✓
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
              title="Cancelar"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            title="Editar"
          >
            ✏️
          </button>
        )}
      </td>
    </tr>
  );
};

export default AddiSistecreditoPayments;