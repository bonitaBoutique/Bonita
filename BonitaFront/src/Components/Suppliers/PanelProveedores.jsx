import { Link } from 'react-router-dom';
import Navbar2 from '../Navbar2';

const PanelProveedores = () => {
  return (
    <>
      <Navbar2/>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-6xl px-6 py-8 mt-24">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🏭 Panel de Proveedores
            </h1>
            <p className="text-gray-600 text-lg">
              Gestiona tus proveedores y compras de manera eficiente
            </p>
          </div>

          {/* Cards principales con 4 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Listar Proveedores */}
            <Link 
              to="/suppliers" 
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 text-center border-l-4 border-blue-500"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                📋
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Listar Proveedores
              </h3>
              <p className="text-gray-600 text-xs mb-3">
                Ver y gestionar tus proveedores
              </p>
              <div className="mt-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                Ver Lista
              </div>
            </Link>

            {/* Nuevo Proveedor */}
            <Link 
              to="/suppliers/new" 
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 text-center border-l-4 border-pink-500"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                ➕
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Nuevo Proveedor
              </h3>
              <p className="text-gray-600 text-xs mb-3">
                Registrar un nuevo proveedor
              </p>
              <div className="mt-3 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
                Crear Nuevo
              </div>
            </Link>

            {/* Facturas de Compra */}
            <Link 
              to="/suppliers/invoices/create" 
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 text-center border-l-4 border-green-500"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                📄
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Nueva Factura
              </h3>
              <p className="text-gray-600 text-xs mb-3">
                Registrar factura de compra
              </p>
              <div className="mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                Crear Factura
              </div>
            </Link>

            {/* Registrar Pago */}
            <Link 
              to="/suppliers/payments/create" 
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 text-center border-l-4 border-purple-500"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                💰
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Registrar Pago
              </h3>
              <p className="text-gray-600 text-xs mb-3">
                Pagar facturas de proveedores
              </p>
              <div className="mt-3 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                Nuevo Pago
              </div>
            </Link>
          </div>

          {/* Sección de acceso rápido a resumen de cuentas */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">📊</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Estado de Cuentas
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Visualiza deudas pendientes, facturas vencidas y próximos pagos
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link 
                  to="/suppliers"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  📋 Ver Proveedores
                </Link>
              </div>
            </div>
          </div>

          {/* Cards de información */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Info: Facturas */}
            <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-green-500">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">📄</div>
                <h4 className="font-bold text-gray-800">Facturas de Compra</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Registra tus facturas de compra con la opción de cargar comprobantes en la nube.
              </p>
            </div>

            {/* Info: Pagos */}
            <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-purple-500">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">💳</div>
                <h4 className="font-bold text-gray-800">Pagos</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Registra pagos parciales o totales con comprobantes y seguimiento automático de saldos.
              </p>
            </div>

            {/* Info: Reportes */}
            <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-orange-500">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">📈</div>
                <h4 className="font-bold text-gray-800">Reportes</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Visualiza resúmenes de cuentas, facturas vencidas y estadísticas mensuales.
              </p>
            </div>
          </div>

          {/* Footer informativo */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              💡 <strong>Tip:</strong> Mantén tus cuentas al día registrando facturas y pagos puntualmente
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelProveedores;
