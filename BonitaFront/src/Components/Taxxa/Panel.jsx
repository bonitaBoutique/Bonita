
import { Link } from 'react-router-dom';



const Panel = () => {
  


  return (
    <div className="min-h-screen bg-gray-400 flex flex-col items-center">
      <div className="relative w-full flex justify-between items-center mr-6 ml-6">
        <nav className="w-full flex justify-start items-center py-4 px-8 bg-transparent">
         
        </nav>
       
      </div>

      <div className="bg-gray-200 w-full max-w-4xl p-8 rounded-lg shadow-lg mt-32">
       

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
            <>
              <Link to="/panel/seller" className="bg-blue-500 text-white px-4 py-8 rounded-lg hover:bg-blue-600 flex items-center justify-center text-center">
                Completar por Unica Vez los datos del Comercio / Modificar Datos
              </Link>
              <Link to="/panel/facturacion" className="bg-blue-500 text-white px-4 py-8 rounded-lg hover:bg-blue-600 flex items-center justify-center text-center">
                Facturación
              </Link>
              <Link to="/panel/ordenesPendientes" className="bg-blue-500 text-white px-4 py-8 rounded-lg hover:bg-blue-600 flex items-center justify-center text-center">
                Ordenes Pendientes
              </Link>
            </>
        
        </div>

        <p className="text-gray-700 text-center">
          ¡Gestiona los recursos desde el panel!
        </p>
      </div>
    </div>
  );
};

export default Panel;