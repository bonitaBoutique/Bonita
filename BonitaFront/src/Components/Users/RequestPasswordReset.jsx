import React, { useState } from 'react';
import axios from 'axios';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/correo/forgotPassword', { email });
      setMessage(data.message);
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <form onSubmit={submitHandler} className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl mb-6 text-center">Recuperar Contraseña</h2>
        {message && <div className="mb-4 text-center">{message}</div>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md">Enviar</button>
      </form>
    </div>
  );
};

export default RequestPasswordReset;