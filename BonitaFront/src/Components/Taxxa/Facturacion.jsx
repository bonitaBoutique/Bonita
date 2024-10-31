import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserByDocument, registerUser } from '../../Redux/Actions/actions';

const Facturacion = () => {
  const dispatch = useDispatch();
  const [n_document, set_Ndocument] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Nuevo estado para controlar la búsqueda
  const [newUserData, setNewUserData] = useState({
    n_document: '',
    first_name: '',
    last_name: '',
    gender: '',
    email: '',
    password: '',
    phone: '',
    city: ''
  });

  const userState = useSelector(state => state.data);
  console.log(userState)

  const handleUserSearch = (e) => {
    e.preventDefault();
    setIsSearching(true); // Activar el estado de búsqueda
    dispatch(fetchUserByDocument(n_document));
  };

  useEffect(() => {
    if (!isSearching) return; // Solo ejecutar si está buscando
    
    if (userState.error === "Usuario no encontrado") {
      setShowRegisterModal(true);  // Mostrar modal si no se encuentra el usuario
    } else if (userState.data && Object.keys(userState.data).length > 0) {
      setShowRegisterModal(false); // Ocultar modal si el usuario existe
    }
  
    setIsSearching(false); // Finaliza la búsqueda
  }, [userState, isSearching]);
  
  

  const handleInputChange = (e) => {
    setNewUserData({ ...newUserData, [e.target.name]: e.target.value });
  };

  const handleRegisterUser = (e) => {
    e.preventDefault();
    dispatch(registerUser(newUserData));
    setShowRegisterModal(false);
  };

  return (
    <div className="min-h-screen pt-20 px-8">
      {/* Formulario de búsqueda de usuario */}
      <form onSubmit={handleUserSearch} className="mb-4 mt-32">
        <input
          type="text"
          value={n_document}
          onChange={(e) => set_Ndocument(e.target.value)}
          placeholder="Buscar usuario por documento"
          required
          className="p-2 border border-gray-300 rounded mr-2"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Buscar Usuario</button>
      </form>

      {/* Mostrar resultado de usuario o error */}
      {userState.loading ? (
        <p className="text-gray-600">Cargando usuario...</p>
      ) : userState.data ? (
        <div>
          <h3 className="text-lg font-semibold">Usuario encontrado:</h3>
          <p>Nombre: {userState.data.first_name} {userState.data.last_name}</p>
          <p>Email: {userState.data.email}</p>
          <p>Teléfono: {userState.data.phone}</p>
        </div>
      ) : userState.error && !isSearching ? (
        <p className="text-red-600">Error: {userState.error}</p>
      ) : null}

      {/* Modal para el registro de usuario */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Registrar Nuevo Usuario</h3>
            <form onSubmit={handleRegisterUser} className="space-y-3">
              <input type="text" name="n_document" placeholder="Documento" onChange={handleInputChange} required className="p-2 border w-full"/>
              <input type="text" name="first_name" placeholder="Nombre" onChange={handleInputChange} required className="p-2 border w-full"/>
              <input type="text" name="last_name" placeholder="Apellido" onChange={handleInputChange} required className="p-2 border w-full"/>
              <input type="text" name="gender" placeholder="Género" onChange={handleInputChange} required className="p-2 border w-full"/>
              <input type="email" name="email" placeholder="Email" onChange={handleInputChange} required className="p-2 border w-full"/>
              <input type="password" name="password" placeholder="Contraseña" onChange={handleInputChange} required className="p-2 border w-full"/>
              <input type="text" name="phone" placeholder="Teléfono" onChange={handleInputChange} required className="p-2 border w-full"/>
              <input type="text" name="city" placeholder="Ciudad" onChange={handleInputChange} required className="p-2 border w-full"/>
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Registrar Usuario</button>
            </form>
            <button onClick={() => setShowRegisterModal(false)} className="mt-4 w-full text-gray-500">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturacion;





