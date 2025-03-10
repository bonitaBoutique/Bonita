import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../Redux/Actions/actions';
import { useNavigate } from 'react-router-dom';
import imgFondo from '../../assets/img/BannerPrincipal/banner6.png';
import { IoEyeOff, IoEye } from 'react-icons/io5';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  // Redirect if user is logged in
  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${imgFondo})` }}
    >
      <form
        onSubmit={submitHandler}
        className="max-w-lg w-full bg-white bg-opacity-80 p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl mb-6 text-center">Iniciar Sesión</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
        <div>
          <button
            type="submit"
            className="w-full bg-colorFooter text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </div>
        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ¿No tienes cuenta? Regístrate
          </button>
          <button
            type="button"
            onClick={() => navigate('/recuperar')}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
