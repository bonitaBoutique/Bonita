import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../Redux/Actions/actions';
import { useNavigate } from 'react-router-dom';
import imgFondo from '../../assets/img/BannerPrincipal/banner6.png';
import Swal from 'sweetalert2';
import { IoEyeOff, IoEye } from 'react-icons/io5';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    n_document: '',
    wdoctype: '',
    phone: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get state from Redux
  const { loading, error, success } = useSelector((state) => state.userRegister);
  const loggedInUserRole = useSelector((state) => state.userLogin.userInfo?.role);

  // Debug logging
  useEffect(() => {
    console.log('Current State:', { loading, error, success, loggedInUserRole });
  }, [loading, error, success, loggedInUserRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === "n_document") {
        return {
          ...prev,
          n_document: value,
          password: value,
          confirmPassword: value,
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // Consolidated success/error handling
  useEffect(() => {
    if (success) {
      Swal.fire({
        title: '¡Éxito!',
        text: 'Usuario creado exitosamente',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Ok'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
    } else if (error) {
      Swal.fire({
        title: '¡Error!',
        text: error,
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ok'
      });
    }
  }, [success, error, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: '¡Error!',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ok'
      });
      return;
    }
    await dispatch(registerUser(formData));
  };

  // Handle success/error effects

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${imgFondo})` }}
    >
      <form
        onSubmit={submitHandler}
        className="max-w-lg w-full bg-white bg-opacity-80 p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl mb-6 text-center">Registrarse</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
            Apellido
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
        <label>
        Tipo de Documento:
        <select name="wdoctype" value={formData.wdoctype} onChange={handleChange}>
          <option value="">Cédula de ciudadanía</option>
          <option value="RC">Registro civil</option>
          <option value="TI">Tarjeta de identidad</option>
          <option value="CC">Cédula de ciudadanía</option>
          <option value="TE">Tarjeta de extranjería</option>
          <option value="CE">Cédula de extranjería</option>
          <option value="NIT">NIT</option>
          <option value="PAS">Pasaporte</option>
          <option value="DEX">Documento de identificación extranjero</option>
          <option value="PEP">PEP (Permiso Especial de Permanencia)</option>
          <option value="PPT">PPT (Permiso Protección Temporal)</option>
          <option value="FI">NIT de otro país</option>
          <option value="NUIP">NUIP</option>
        </select>
      </label>
        </div>


        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Documento
          </label>
          <input
            type="text"
            name="n_document"
            value={formData.n_document}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Telefono
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <IoEyeOff size={24} /> : <IoEye size={24} />}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <IoEyeOff size={24} /> : <IoEye size={24} />}
            </button>
          </div>
        </div>
        {loggedInUserRole === 'Admin' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="User">Usuario</option>
              <option value="Admin">Administrador</option>
              <option value="Cajero">Cajero</option>
            </select>
          </div>
        )}
        <div>
          <button
            type="submit"
            className="w-full bg-colorFooter text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ¿Ya tienes cuenta? Inicia sesión aquí
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;