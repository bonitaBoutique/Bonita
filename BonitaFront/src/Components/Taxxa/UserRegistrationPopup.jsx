/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../Redux/Actions/actions';
import Swal from 'sweetalert2';

const UserRegistrationPopup = ({ onClose, prefilledDocument = '' }) => {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState({
    n_document: prefilledDocument,
    first_name: '',
    last_name: '',
    gender: 'F',
    email: '',
    password: '',
    phone: '',
    city: '',
    wdoctype: 'CC', // ✅ AGREGAR CAMPO OBLIGATORIO
    role: 'User', // ✅ AGREGAR ROLE POR DEFECTO
    // ✅ CAMPOS OPCIONALES PARA TAXXA (con valores por defecto)
    wlegalorganizationtype: 'person',
    scostumername: '',
    stributaryidentificationkey: '',
    sfiscalresponsibilities: 'R-99-PN',
    sfiscalregime: 'ordinario'
  });

  const [isLoading, setIsLoading] = useState(false);

  // ✅ ACTUALIZAR documento cuando cambie la prop
  useEffect(() => {
    if (prefilledDocument) {
      setUserData(prev => ({
        ...prev,
        n_document: prefilledDocument
      }));
    }
  }, [prefilledDocument]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));

    // ✅ AUTO-LLENAR scostumername cuando se escriba el nombre
    if (name === 'first_name' || name === 'last_name') {
      setUserData(prev => ({
        ...prev,
        scostumername: `${name === 'first_name' ? value : prev.first_name} ${name === 'last_name' ? value : prev.last_name}`.trim()
      }));
    }
  };

  const validateForm = () => {
    // ✅ VALIDACIONES MEJORADAS
    if (!userData.n_document || userData.n_document.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El documento debe tener al menos 8 dígitos",
      });
      return false;
    }

    if (!userData.first_name.trim() || !userData.last_name.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Nombre y apellido son requeridos",
      });
      return false;
    }

    if (!userData.email || !userData.email.includes('@')) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Email válido es requerido",
      });
      return false;
    }

    if (!userData.password || userData.password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      return false;
    }

    if (!userData.phone.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El teléfono es requerido",
      });
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // ✅ PREPARAR DATOS LIMPIOS
      const cleanUserData = {
        ...userData,
        first_name: userData.first_name.trim(),
        last_name: userData.last_name.trim(),
        email: userData.email.toLowerCase().trim(),
        phone: userData.phone.trim(),
        city: userData.city.trim() || 'No especificada',
        scostumername: userData.scostumername || `${userData.first_name} ${userData.last_name}`.trim()
      };

      console.log('📤 [POPUP] Registrando usuario:', cleanUserData);

      const result = await dispatch(registerUser(cleanUserData));
      
      console.log('✅ [POPUP] Usuario registrado exitosamente:', result);
      
      // ✅ CERRAR POPUP SOLO SI FUE EXITOSO
      onClose();
      
    } catch (error) {
      console.error('❌ [POPUP] Error en registro:', error);
      // ✅ NO cerrar el popup si hay error, para que el usuario pueda corregir
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Registrar Usuario</h2>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* ✅ DOCUMENTO PRELLENADO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento *
            </label>
            <input 
              type="text" 
              name="n_document" 
              placeholder="Número de documento" 
              value={userData.n_document}
              onChange={handleChange} 
              readOnly={!!prefilledDocument}
              className={`w-full p-2 border rounded ${prefilledDocument ? 'bg-gray-100' : ''}`}
              required 
            />
          </div>

          {/* ✅ TIPO DE DOCUMENTO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento *
            </label>
            <select 
              name="wdoctype" 
              value={userData.wdoctype}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="PP">Pasaporte</option>
            </select>
          </div>
          
          {/* ✅ NOMBRES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input 
                type="text" 
                name="first_name" 
                placeholder="Nombre" 
                value={userData.first_name}
                onChange={handleChange} 
                className="w-full p-2 border rounded"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input 
                type="text" 
                name="last_name" 
                placeholder="Apellido" 
                value={userData.last_name}
                onChange={handleChange} 
                className="w-full p-2 border rounded"
                required 
              />
            </div>
          </div>

          {/* ✅ GÉNERO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género *
            </label>
            <select 
              name="gender" 
              value={userData.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
              <option value="O">Otro</option>
            </select>
          </div>
          
          {/* ✅ EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input 
              type="email" 
              name="email" 
              placeholder="correo@ejemplo.com" 
              value={userData.email}
              onChange={handleChange} 
              className="w-full p-2 border rounded"
              required 
            />
          </div>
          
          {/* ✅ CONTRASEÑA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <input 
              type="password" 
              name="password" 
              placeholder="Mínimo 6 caracteres" 
              value={userData.password}
              onChange={handleChange} 
              minLength="6"
              className="w-full p-2 border rounded"
              required 
            />
          </div>
          
          {/* ✅ TELÉFONO Y CIUDAD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input 
                type="tel" 
                name="phone" 
                placeholder="3001234567" 
                value={userData.phone}
                onChange={handleChange} 
                className="w-full p-2 border rounded"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input 
                type="text" 
                name="city" 
                placeholder="Ciudad" 
                value={userData.city}
                onChange={handleChange} 
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* ✅ BOTONES */}
          <div className="flex justify-end gap-2 mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isLoading}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isLoading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistrationPopup;