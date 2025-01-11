
import { Link } from 'react-router-dom';
import Navbar2 from './Navbar2';


const PanelGeneral = () => {
  


  return (
    <>
   <Navbar2/>
    <div className="min-h-screen bg-gray-400 flex flex-col items-center">
      <div className="relative w-full flex justify-between items-center mr-6 ml-6">
        <nav className="w-full flex justify-start items-center py-4 px-8 bg-transparent">
         
        </nav>
       
      </div>

      <div className="bg-gray-200 w-full max-w-4xl p-8 rounded-lg shadow-lg mt-32">
       

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <>
  {/* Botón Panel Productos */}
  <div className="text-center space-y-2">
    <Link
      to="/panelProductos"
      className="bg-pink-300 text-slate-600 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-pink-200 flex items-center justify-center"
    >
      Productos
    </Link>
    <p className="text-sm text-slate-600">
      Administra y gestiona todos los Artículos disponibles en el sistema.
    </p>
  </div>

  {/* Botón Facturación */}
  <div className="text-center space-y-2">
    <Link
      to="/panel"
      className="bg-pink-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-pink-200 flex items-center justify-center"
    >
      Facturación
    </Link>
    <p className="text-sm text-slate-600">
      Accede al módulo de Caja, Facturación, Órdenes pendientes, Datos del Comercio .
    </p>
  </div>
  <div className="text-center space-y-2">
    <Link
      to="/panelGastos"
      className="bg-pink-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-pink-200 flex items-center justify-center"
    >
     Gastos
    </Link>
    <p className="text-sm text-slate-600">
      Accede al módulo de Caja, Facturación, Órdenes pendientes, Datos del Comercio .
    </p>
  </div>
  <div className="text-center space-y-2">
    <Link
      to="/panelIngresos"
      className="bg-pink-300 text-slate-700 font-nunito font-normal text-2xl px-4 py-8 rounded-lg hover:bg-pink-200 flex items-center justify-center"
    >
     Ingresos
    </Link>
    <p className="text-sm text-slate-600">
      Accede al módulo de Caja, Facturación, Órdenes pendientes, Datos del Comercio .
    </p>
  </div>
  
</>

        
        </div>

        
      </div>
    </div>
    </>
  );
};

export default PanelGeneral;