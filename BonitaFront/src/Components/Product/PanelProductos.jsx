
import { Link } from 'react-router-dom';



const PanelProductos = () => {
  


  return (
    <div className="min-h-screen bg-colorBeige flex flex-col items-center">
      <div className="relative w-full flex justify-between items-center mr-6 ml-6">
        <nav className="w-full flex justify-start items-center py-4 px-8 bg-transparent">
         
        </nav>
       
      </div>

      <div className="bg-gray-200 w-full max-w-4xl p-8 rounded-lg shadow-lg mt-32">
       

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
            <>
              <Link to="/createProducts" className="bg-blue-500 text-white px-4 py-8 rounded-lg hover:bg-blue-600 flex items-center justify-center text-center">
                Cargar Articulos
              </Link>
             
              <Link to="/panel/productos" className="bg-blue-500 text-white px-4 py-8 rounded-lg hover:bg-blue-600 flex items-center justify-center text-center">
                Listar Articulos
              </Link>
            </>
        
        </div>

        
      </div>
    </div>
  );
};

export default PanelProductos;