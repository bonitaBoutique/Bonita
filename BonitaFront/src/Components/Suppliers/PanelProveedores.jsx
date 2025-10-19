import { Link } from 'react-router-dom';
import Navbar2 from '../Navbar2';
import { FiList, FiUserPlus, FiFileText, FiDollarSign, FiTrendingUp, FiAlertCircle, FiZap, FiCheckCircle } from 'react-icons/fi';

const PanelProveedores = () => {
  return (
    <>
      <Navbar2/>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8 mt-20">
          {/* Header con llamado a la acción principal */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Gestión de Proveedores
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Administra tus proveedores, facturas y pagos de forma rápida y eficiente
            </p>
            
            {/* CTA Principal - Ir al listado */}
            <Link 
              to="/suppliers"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg font-semibold"
            >
              <FiList className="text-2xl" />
              Ver Todos los Proveedores
              <span className="ml-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                ⚡ Resumen Incluido
              </span>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              💡 Ahora con resumen de cuentas, deudas y acceso rápido a pagos
            </p>
          </div>

          {/* Sección: Acciones Rápidas - Flujo Principal */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FiZap className="text-blue-600 text-2xl" />
              <h2 className="text-2xl font-bold text-gray-900">
                Acciones Rápidas
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Accesos directos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Nuevo Proveedor */}
              <Link 
                to="/suppliers/new" 
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-pink-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pink-100 rounded-xl group-hover:bg-pink-200 transition-colors">
                    <FiUserPlus className="text-pink-600 text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Nuevo Proveedor
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Registra un nuevo proveedor con toda su información de contacto y términos de pago
                    </p>
                    <div className="flex items-center text-pink-600 font-medium text-sm">
                      Crear ahora
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Nueva Factura */}
              <Link 
                to="/suppliers/invoices/create" 
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-green-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                    <FiFileText className="text-green-600 text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Registrar Factura
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Carga una nueva factura de compra con comprobante digital y detalles completos
                    </p>
                    <div className="flex items-center text-green-600 font-medium text-sm">
                      Registrar ahora
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Registrar Pago */}
              <Link 
                to="/suppliers/payments/create" 
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-purple-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <FiDollarSign className="text-purple-600 text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Registrar Pago
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Registra pagos parciales o totales con comprobante y actualización automática
                    </p>
                    <div className="flex items-center text-purple-600 font-medium text-sm">
                      Pagar ahora
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

       

          {/* Sección: Flujos Comunes */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FiAlertCircle className="text-orange-600 text-2xl" />
              <h2 className="text-2xl font-bold text-gray-900">
                ¿Cómo empezar?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Flujo 1 */}
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
                <div className="text-3xl mb-4">1️⃣</div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">
                  Para Nuevo Proveedor
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">→</span>
                    <span>Crea el proveedor con sus datos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">→</span>
                    <span>Registra la primera factura</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">→</span>
                    <span>Haz seguimiento en el listado</span>
                  </div>
                </div>
              </div>

              {/* Flujo 2 */}
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
                <div className="text-3xl mb-4">2️⃣</div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">
                  Para Pagar Facturas
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">→</span>
                    <span>Ve al listado de proveedores</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">→</span>
                    <span>Click en el proveedor</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">→</span>
                    <span>Click "💳 Pagar" en la factura</span>
                  </div>
                </div>
              </div>

              {/* Flujo 3 */}
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500">
                <div className="text-3xl mb-4">3️⃣</div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">
                  Para Ver Estado de Cuenta
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">→</span>
                    <span>Ve al listado de proveedores</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">→</span>
                    <span>Ve el resumen en el panel superior</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">→</span>
                    <span>Identifica deudas por colores</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con Tips */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl shadow-md p-6 border border-orange-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <span className="text-2xl">💡</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  Tips para mejor gestión
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span><strong>Registra facturas inmediatamente</strong> al recibirlas para tener control total de tus compromisos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span><strong>Usa el botón "Pagar" en la tabla</strong> para pagos rápidos sin salir del detalle del proveedor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span><strong>Revisa el panel de resumen</strong> en el listado para identificar proveedores con deudas altas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span><strong>Sube comprobantes</strong> de facturas y pagos para mejor trazabilidad</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelProveedores;
