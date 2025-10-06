import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar2 from "./Navbar2";

const PanelGeneral = () => {
  // ✅ Obtener información del usuario logueado
  const userInfo = useSelector((state) => state.userLogin.userInfo);
  const isCajero = userInfo?.role === 'Cajero';

  return (
    <>
      <Navbar2 />
      <div className="min-h-screen bg-gray-400 flex flex-col items-center">
        <div className="relative w-full flex justify-between items-center mr-6 ml-6">
          <nav className="w-full flex justify-start items-center py-4 px-8 bg-transparent"></nav>
        </div>

        <div className="bg-gray-200 w-full max-w-4xl p-8 rounded-lg shadow-lg mt-32">
          {/* ✅ Mostrar información del rol si es cajero */}
          {isCajero && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <strong>👤 Panel de Cajero:</strong> Acceso limitado a las funciones principales de caja.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <>
              {/* ✅ Productos - OCULTO para Cajeros */}
              {!isCajero && (
                <div className="text-center space-y-2">
                  <Link
                    to="/panelProductos"
                    className="bg-slate-300 text-slate-600 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-slate-400 flex items-center justify-center"
                  >
                    Productos
                  </Link>
                  <p className="text-sm text-slate-600">
                    Administra y gestiona todos los Artículos disponibles en el
                    sistema.
                  </p>
                </div>
              )}

              {/* ✅ Facturación - OCULTO para Cajeros */}
              {!isCajero && (
                <div className="text-center space-y-2">
                  <Link
                    to="/panel"
                    className="bg-pink-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-slate-400 flex items-center justify-center"
                  >
                    Facturación
                  </Link>
                  <p className="text-sm text-slate-600">
                    Accede al módulo Facturación, Órdenes pendientes, Datos del
                    Comercio.
                  </p>
                </div>
              )}

              {/* ✅ Clientes - VISIBLE para todos */}
              <div className="text-center space-y-2">
                <Link
                  to="/accountClient"
                  className="bg-slate-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-slate-400 flex items-center justify-center"
                >
                  Clientes
                </Link>
                <p className="text-sm text-slate-600">
                  Listado de clientes y saldos
                </p>
              </div>

              {/* ✅ Gastos - VISIBLE para todos */}
              <div className="text-center space-y-2">
                <Link
                  to="/panelGastos"
                  className="bg-pink-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-pink-200 flex items-center justify-center"
                >
                  Gastos
                </Link>
                <p className="text-sm text-slate-600">
                  Accede al módulo de Gastos.
                </p>
              </div>

              {/* ✅ Informes - VISIBLE para todos */}
              <div className="text-center space-y-2">
                <Link
                  to="/informes"
                  className="bg-slate-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-pink-200 flex items-center justify-center"
                >
                  Informes
                </Link>
                <p className="text-sm text-slate-600">
                  Informes de Ingresos y Egresos
                </p>
              </div>

              {/* ✅ Cuentas por cobrar - VISIBLE para todos */}
              <div className="text-center space-y-2">
                <Link
                  to="/reservas"
                  className="bg-pink-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-pink-200 flex items-center justify-center"
                >
                  Cuentas por cobrar
                </Link>
                <p className="text-sm text-slate-600">Listado de Reservas</p>
              </div>

              {/* ✅ Gift Cards - VISIBLE para todos */}
              <div className="text-center space-y-2">
                <Link
                  to="/active-giftcards"
                  className="bg-pink-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-pink-200 flex items-center justify-center"
                >
                  Gift Cards
                </Link>
                <p className="text-sm text-slate-600">
                  Listado de Gift Cards Activas
                </p>
              </div>

              {/* ✅ Addi/Sistecredito - OCULTO para Cajeros */}
              {!isCajero && (
                <div className="text-center space-y-2">
                  <Link
                    to="/pagoCredito"
                    className="bg-pink-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-pink-200 flex items-center justify-center"
                  >
                    Addi / Sistecredito
                  </Link>
                  <p className="text-sm text-slate-600">
                    Listado de Pagos Addi / Sistecredito
                  </p>
                </div>
              )}

              {/* ✅ Pagos en Línea - SOLO ADMIN */}
              {!isCajero && (
                <div className="text-center space-y-2">
                  <Link
                    to="/pagos/online"
                    className="bg-slate-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-slate-400 flex items-center justify-center"
                  >
                    💳 Pagos en Línea
                  </Link>
                  <p className="text-sm text-slate-600">
                    Gestión y seguimiento de pagos online (Wompi)
                  </p>
                </div>
              )}

              ✅ Proveedores - SOLO ADMIN
              {!isCajero && (
                <div className="text-center space-y-2">
                  <Link
                    to="/panelProveedores"
                    className="bg-pink-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-pink-200 flex items-center justify-center"
                  >
                    � Proveedores
                  </Link>
                  <p className="text-sm text-slate-600">
                    Gestión de proveedores, facturas de compra y pagos
                  </p>
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelGeneral;