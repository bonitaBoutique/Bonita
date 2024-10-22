import React from 'react';
import './Animation.css'; // Archivo de estilos CSS para la animación
import img from '../assets/img/fondoVerde.png'
const Animation = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="relative z-10 flex items-center justify-center h-64 md:h-96 overflow-hidden">
        <div className="flex items-center justify-center">
          <div className="relative z-20">
            <h2 className="text-white text-4xl md:text-5xl font-bold mb-4">¡Ven a Conocernos!</h2>
            <p className="text-white text-lg md:text-xl mb-8">Descubre nuestros productos Artesanales</p>
            <a href="/register" className="bg-white text-gray-900 py-2 px-6 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-200 transition duration-300">Registrate</a>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <img className="object-cover h-full w-full" src={img} alt="Promo Image" />
        </div>
      </div>
    </div>
  );
}


export default Animation;