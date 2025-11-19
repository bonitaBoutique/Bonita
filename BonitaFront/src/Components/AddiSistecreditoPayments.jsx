import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import axios from 'axios';
import { BASE_URL } from '../Config';

// ✅ COMPONENTE: Formulario de depósito (FUERA del componente principal)
const DepositForm = ({ depositForm, setDepositForm, handleRegisterDeposit, setShowDepositForm }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">💰 Registrar Nuevo Depósito</h3>
      <button
        onClick={() => setShowDepositForm(false)}
        className="text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>
    
    <form onSubmit={handleRegisterDeposit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plataforma *
          </label>
          <select
            value={depositForm.platform}
            onChange={(e) => setDepositForm(prev => ({...prev, platform: e.target.value}))}
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
            value={depositForm.depositDate}
            onChange={(e) => setDepositForm(prev => ({...prev, depositDate: e.target.value}))}
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
            value={depositForm.amount}
            onChange={(e) => setDepositForm(prev => ({...prev, amount: e.target.value}))}
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
            value={depositForm.referenceNumber}
            onChange={(e) => setDepositForm(prev => ({...prev, referenceNumber: e.target.value}))}
            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            placeholder="REF123456"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <input
            type="text"
            value={depositForm.description}
            onChange={(e) => setDepositForm(prev => ({...prev, description: e.target.value}))}
            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Depósito mensual Addi, etc."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setShowDepositForm(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
        >
          💰 Registrar Depósito
        </button>
      </div>
    </form>
  </div>
);

const ControlAddiSistecreditoPayments = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ✅ Estados para gestión de datos
  const [conciliationData, setConciliationData] = useState({
    summary: {
      deposits: { totalAmount: 0, count: 0, byPlatform: { Addi: 0, Sistecredito: 0 } },
      receipts: { totalAmount: 0, count: 0, byPlatform: { Addi: 0, Sistecredito: 0 } },
      difference: { total: 0, Addi: 0, Sistecredito: 0 }
    },
    deposits: [],
    receipts: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview'); // overview, addi, sistecredito, deposits
  
  // ✅ Filtros
  const [filters, setFilters] = useState({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    platform: 'all'
  });

  // ✅ Estados para registro de depósitos
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositForm, setDepositForm] = useState({
    platform: 'Addi',
    depositDate: dayjs().format('YYYY-MM-DD'),
    amount: '',
    referenceNumber: '',
    description: '',
    notes: ''
  });

  // ✅ Ref para acceder al formulario sin causar re-renders
  const depositFormRef = useRef(depositForm);
  useEffect(() => {
    depositFormRef.current = depositForm;
  }, [depositForm]);

  // ✅ FUNCIÓN: Cargar datos de conciliación (memoizada)
  const fetchConciliationData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Obteniendo datos de conciliación...');
      
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        platform: filters.platform === 'all' ? undefined : filters.platform
      };

      // Limpiar parámetros undefined
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get(`${BASE_URL}/addi-sistecredito/conciliation`, {
        params
      });

      if (response.data.success) {
        setConciliationData(response.data.data);
        console.log('✅ Datos de conciliación cargados:', response.data.data.summary);
      } else {
        throw new Error(response.data.message || 'Error al cargar conciliación');
      }
    } catch (error) {
      console.error('❌ Error al cargar conciliación:', error);
      setError(error.response?.data?.message || error.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ✅ FUNCIÓN: Registrar depósito (usando ref para evitar recreación)
  const handleRegisterDeposit = useCallback(async (e) => {
    e.preventDefault();
    
    const formData = depositFormRef.current;
    
    if (!formData.amount || formData.amount <= 0) {
      alert('❌ Ingresa un monto válido');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/addi-sistecredito/deposit`, {
        ...formData,
        amount: parseFloat(formData.amount),
        registeredBy: 'admin'
      });

      if (response.data.success) {
        alert('✅ Depósito registrado exitosamente');
        
        // Limpiar formulario
        setDepositForm({
          platform: formData.platform,
          depositDate: dayjs().format('YYYY-MM-DD'),
          amount: '',
          referenceNumber: '',
          description: '',
          notes: ''
        });
        
        setShowDepositForm(false);
        await fetchConciliationData();
      } else {
        throw new Error(response.data.message || 'Error al registrar');
      }
    } catch (error) {
      console.error('❌ Error al registrar depósito:', error);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  }, [fetchConciliationData]);

  // ✅ FUNCIÓN: Marcar recibo como conciliado
  const markReceiptAsConciliated = useCallback(async (receiptId, platform) => {
    try {
      const confirmed = window.confirm(
        `¿Marcar el recibo #${receiptId} de ${platform} como conciliado?`
      );
      
      if (!confirmed) return;

      console.log(`🔄 Marcando recibo ${receiptId} como conciliado`);
      
      const response = await axios.put(
        `${BASE_URL}/addi-sistecredito/receipt/${receiptId}/conciliate`,
        { isConciliated: true }
      );

      if (response.data.success) {
        console.log('✅ Recibo marcado como conciliado');
        alert('✅ Recibo marcado como conciliado exitosamente');
        
        // ✅ Recargar datos para reflejar el cambio
        await fetchConciliationData();
      } else {
        throw new Error(response.data.message || 'Error al marcar recibo');
      }
    } catch (error) {
      console.error('❌ Error al marcar recibo:', error);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  }, [fetchConciliationData]);

  // ✅ Cargar datos al inicio y cuando cambien los filtros
  useEffect(() => {
    fetchConciliationData();
  }, [filters]);

  // ✅ COMPONENTE: Tarjetas de resumen
  const SummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
        <h3 className="text-lg font-semibold text-green-800">💰 Depósitos</h3>
        <p className="text-2xl font-bold text-green-900">
          ${conciliationData.summary.deposits.totalAmount.toLocaleString('es-CO')}
        </p>
        <p className="text-sm text-green-700">
          {conciliationData.summary.deposits.count} registros
        </p>
      </div>
      
      <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-800">🧾 Ventas</h3>
        <p className="text-2xl font-bold text-blue-900">
          ${conciliationData.summary.receipts.totalAmount.toLocaleString('es-CO')}
        </p>
        <p className="text-sm text-blue-700">
          {conciliationData.summary.receipts.count} recibos
        </p>
      </div>
      
      <div className={`p-4 rounded-lg border-l-4 ${
        conciliationData.summary.difference.total >= 0 
          ? 'bg-green-100 border-green-500' 
          : 'bg-red-100 border-red-500'
      }`}>
        <h3 className={`text-lg font-semibold ${
          conciliationData.summary.difference.total >= 0 
            ? 'text-green-800' 
            : 'text-red-800'
        }`}>
          ⚖️ Diferencia
        </h3>
        <p className={`text-2xl font-bold ${
          conciliationData.summary.difference.total >= 0 
            ? 'text-green-900' 
            : 'text-red-900'
        }`}>
          ${Math.abs(conciliationData.summary.difference.total).toLocaleString('es-CO')}
        </p>
        <p className={`text-sm ${
          conciliationData.summary.difference.total >= 0 
            ? 'text-green-700' 
            : 'text-red-700'
        }`}>
          {conciliationData.summary.difference.total >= 0 ? 'A favor' : 'Pendiente'}
        </p>
      </div>
      
      <div className="bg-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
        <h3 className="text-lg font-semibold text-purple-800">📊 Estado</h3>
        <p className="text-sm text-purple-700">
          <strong>Addi:</strong> ${conciliationData.summary.difference.Addi.toLocaleString('es-CO')}
        </p>
        <p className="text-sm text-purple-700">
          <strong>Sistecredito:</strong> ${conciliationData.summary.difference.Sistecredito.toLocaleString('es-CO')}
        </p>
      </div>
    </div>
  );

  // ✅ COMPONENTE: Lista de recibos pendientes (memoizado)
  const ReceiptsList = React.memo(({ platform }) => {
    const filteredReceipts = conciliationData.receipts.filter(
      receipt => !platform || receipt.payMethod === platform
    );

    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-blue-50 border-b">
          <h3 className="text-lg font-medium text-blue-900">
            🧾 Recibos {platform || 'Todos'} 
            <span className="text-sm font-normal ml-2">
              ({filteredReceipts.length} registros)
            </span>
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredReceipts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              📭 No hay recibos pendientes
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReceipts.map((receipt) => (
                <div key={receipt.id_receipt} className="p-4 hover:bg-gray-50 flex justify-between items-center">
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
                      {receipt.isConciliated && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓ Conciliado
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-semibold text-blue-600">
                      ${receipt.total_amount.toLocaleString('es-CO')}
                    </p>
                    <p className="text-sm text-gray-600">{receipt.buyer_name}</p>
                  </div>
                  
                  {!receipt.isConciliated && (
                    <button
                      onClick={() => markReceiptAsConciliated(receipt.id_receipt, receipt.payMethod)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition duration-200"
                      title="Marcar como conciliado"
                    >
                      ✓ Conciliar
                    </button>
                  )}
                  
                  {receipt.isConciliated && (
                    <span className="text-green-600 text-sm font-medium">
                      ✓ Ya conciliado
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando control de Addi y Sistecredito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 mb-24">
      {/* ✅ Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          💳 Control Addi & Sistecredito
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDepositForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
          >
            ➕ Registrar Depósito
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
          >
            ← Volver
          </button>
        </div>
      </div>

      {/* ✅ Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <span className="text-red-400 text-xl mr-3">❌</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchConciliationData}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition duration-200"
              >
                🔄 Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">🔍 Filtros</h2>
          <button
            onClick={() => setFilters({
              startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
              endDate: dayjs().format('YYYY-MM-DD'),
              platform: 'all'
            })}
            className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition duration-200"
          >
            🔄 Resetear
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({...prev, startDate: e.target.value}))}
              className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({...prev, endDate: e.target.value}))}
              className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
            <select
              value={filters.platform}
              onChange={(e) => setFilters(prev => ({...prev, platform: e.target.value}))}
              className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las plataformas</option>
              <option value="Addi">🛒 Solo Addi</option>
              <option value="Sistecredito">💰 Solo Sistecredito</option>
            </select>
          </div>
        </div>
      </div>

      {/* ✅ Formulario de depósito (condicional) */}
      {showDepositForm && (
        <DepositForm 
          depositForm={depositForm}
          setDepositForm={setDepositForm}
          handleRegisterDeposit={handleRegisterDeposit}
          setShowDepositForm={setShowDepositForm}
        />
      )}

      {/* ✅ Tarjetas de resumen */}
      <SummaryCards />

      {/* ✅ Pestañas */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: '📊 Resumen', icon: '📊' },
          { id: 'addi', label: '🛒 Addi', icon: '🛒' },
          { id: 'sistecredito', label: '💰 Sistecredito', icon: '💰' },
          { id: 'deposits', label: '💰 Depósitos', icon: '💰' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition duration-200 ${
              selectedTab === tab.id
                ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ✅ Contenido según pestaña */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReceiptsList />
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-green-50 border-b">
              <h3 className="text-lg font-medium text-green-900">
                💰 Depósitos Recientes
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {conciliationData.deposits.slice(0, 10).map((deposit) => (
                <div key={deposit.id} className="p-4 border-b hover:bg-gray-50">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'addi' && <ReceiptsList platform="Addi" />}
      {selectedTab === 'sistecredito' && <ReceiptsList platform="Sistecredito" />}
      
      {selectedTab === 'deposits' && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-green-50 border-b">
            <h3 className="text-lg font-medium text-green-900">
              💰 Historial de Depósitos
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
                    📄 Descripción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conciliationData.deposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-50">
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
                      <span className={`px-2 py-1 rounded text-xs ${
                        deposit.status === 'Registrado' ? 'bg-yellow-100 text-yellow-800' :
                        deposit.status === 'Conciliado' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {deposit.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {deposit.description || 'Sin descripción'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlAddiSistecreditoPayments;