import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../Redux/Actions/actions';
import { useNavigate } from 'react-router-dom';
import imgFondo from '../../assets/img/BannerPrincipal/banner6.png'

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    n_document: '',
    phone: '',
    city: '',
    role: 'User', 
    gender: '' 
  });

  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const userRegister = useSelector((state) => state.userRegister);
  const { loading, error, userInfo } = userRegister;

  
  const loggedInUserInfo = useSelector((state) => state.userLogin.userInfo);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData); 
    dispatch(registerUser(formData)).then(() => {
      if (loggedInUserInfo && loggedInUserInfo.role === 'Admin') {
        navigate('/');
      } else {
        navigate('/login');
      }
    });
  };

  return (
    <div 
    className="min-h-screen flex justify-center items-center bg-colorBeige  bg-cover bg-center p-4" 
    style={{ backgroundImage: `url(${imgFondo})` }}
  >
    <div 
      className="w-full max-w-sm p-6 bg-white bg-opacity-80 rounded-md shadow-lg space-y-4"
    >
      <h2 className="text-xl font-semibold text-center">Registro de Cliente</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-sm"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Apellido</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-sm"
              required
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md text-sm"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md text-sm"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium">Documento</label>
            <input
              type="text"
              name="n_document"
              value={formData.n_document}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-sm"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Teléfono</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium">Ciudad</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Género</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md text-sm"
          >
            <option value="">Seleccione</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>
        </div>
        {loggedInUserInfo && loggedInUserInfo.role === 'Admin' && (
          <div>
            <label className="text-sm font-medium">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-sm"
            >
              <option value="User">Usuario</option>
              <option value="Admin">Administrador</option>
            </select>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 text-sm"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </form>
      
    </div>
  </div>
  
  );
};

export default Register;