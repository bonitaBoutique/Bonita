import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createCategory } from '../../Redux/Actions/actions';
import imgFondo from '../../assets/img/banner.png'

const CreateCategory = () => {
  const [name_category, setNameCategory] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const categoryCreate = useSelector((state) => state.categories);
  const { loading, error } = categoryCreate;

  const submitHandler = async (e) => {
    e.preventDefault();
    const result = await dispatch(createCategory(name_category));
    if (result.type === 'CATEGORY_CREATE_SUCCESS') {
      Swal.fire('Creada', 'Categoría creada exitosamente!', 'success');
      navigate('/');
    } else if (result.type === 'CATEGORY_CREATE_FAIL') {
      Swal.fire('No se pudo crear', result.error, 'error');
    }
  };

  return (
    <div 
    className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center " 
    style={{ backgroundImage: `url(${imgFondo})` }}
  >
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md mt-24 mb-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl mb-4 text-center">Crear nueva categoría</h1>
        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name_category">
              Nombre Categoría
            </label>
            <input
              type="text"
              id="name_category"
              placeholder="Nombre"
              value={name_category}
              onChange={(e) => setNameCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-gray-300 font-nunito font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Guardar'}
          </button>
        </form>
        {error && (
          <p className="text-red-500 text-center mt-4">
            {typeof error === 'string' ? error : error.message}
          </p>
        )}
      </div>
    </div>
    </div>
  );
};

export default CreateCategory;


