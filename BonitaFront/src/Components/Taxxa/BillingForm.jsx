import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrdenesPendientes from "./OrdenesPendientes";

const BillingForm = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">📋 Módulo de Facturación</h1>
          <p className="text-blue-100">
            Selecciona un pedido pendiente y haz clic en <strong>"Facturar"</strong> para continuar
          </p>
        </div>
      </div>

      {/* Lista de órdenes con modal integrado */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              📦 Pedidos Pendientes de Facturación
            </h2>
            <button
              onClick={() => navigate("/panel")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              ← Volver al Panel
            </button>
          </div>
          
          {/* Instrucciones */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  ¿Cómo facturar un pedido?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Localiza el pedido que deseas facturar en la tabla</li>
                    <li>Haz clic en el botón <strong>"📝 Facturar"</strong></li>
                    <li>Completa o verifica los datos del comprador en el modal</li>
                    <li>Selecciona el tipo de comprobante (Factura o Nota de Crédito)</li>
                    <li>Haz clic en "Ir a Factura" para completar el proceso</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Componente de órdenes con modal integrado */}
          <OrdenesPendientes 
            filterType="facturablesPendientes"
            mode="standalone"
          />
        </div>
      </div>
    </div>
  );
};

export default BillingForm;