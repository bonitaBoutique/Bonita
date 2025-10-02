import { Link } from 'react-router-dom';
import Navbar2 from '../Navbar2';

const PanelProductos = () => {
  return (
    <>
      <Navbar2/>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center">
        {/* ✅ Header mejorado */}
        <div className="w-full max-w-6xl px-6 py-8 mt-24">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              📦 Panel de Productos
            </h1>
            <p className="text-gray-600 text-lg">
              Gestiona tu inventario de manera eficiente
            </p>
          </div>

          {/* ✅ Cards principales rediseñadas con 4 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Cargar Artículos */}
            <Link 
              to="/createProducts" 
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 text-center border-l-4 border-pink-500"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                📝
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Cargar Artículos
              </h3>
              <p className="text-gray-600 text-xs mb-3">
                Agregar nuevos productos al inventario
              </p>
              <div className="mt-3 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
                Crear Nuevo
              </div>
            </Link>

            {/* Listar Artículos */}
            <Link 
              to="/panel/productos" 
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 text-center border-l-4 border-blue-500"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                📋
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Listar Artículos
              </h3>
              <p className="text-gray-600 text-xs mb-3">
                Ver y editar productos existentes
              </p>
              <div className="mt-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                Ver Inventario
              </div>
            </Link>

            {/* Movimientos de Stock */}
            <Link 
              to="/stock/movements" 
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 text-center border-l-4 border-green-500"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                📊
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Movimientos Stock
              </h3>
              <p className="text-gray-600 text-xs mb-3">
                Historial de entradas y salidas
              </p>
              <div className="mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                Ver Movimientos
              </div>
            </Link>

            {/* ✅ NUEVA CARD: Devoluciones */}
            <Link 
              to="/returns/management" 
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 text-center border-l-4 border-red-500"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                🔄
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Devoluciones
              </h3>
              <p className="text-gray-600 text-xs mb-3">
                Procesar devoluciones y cambios
              </p>
              <div className="mt-3 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                Gestionar
              </div>
            </Link>
          </div>

          {/* ✅ Cards secundarias ampliadas */}
          

          {/* ✅ Nueva sección: Acceso rápido a devoluciones */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">🔄</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Sistema de Devoluciones
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Procesa devoluciones, cambios y genera GiftCards automáticamente
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link 
                  to="/returns/management"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  🔄 Nueva Devolución
                </Link>
                <Link 
                  to="/returns/history"
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  📋 Historial
                </Link>
              </div>
            </div>
          </div>

          {/* ✅ Footer informativo */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              💡 <strong>Tip:</strong> Usa las estadísticas para monitorear el rendimiento de tu inventario
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelProductos;