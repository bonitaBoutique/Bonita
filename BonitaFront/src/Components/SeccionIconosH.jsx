import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchFilteredProducts, setCategoryFilter } from '../Redux/Actions/actions';
import anillo1 from '../assets/img/seccionManilla.png';
import anillo2 from '../assets/img/seccionAnillo.png';
import dije1 from '../assets/img/seccionCadena.png';
import reloj1 from '../assets/img/seccionReloj.png';

const SeccionIconosH = () => {
  const dispatch = useDispatch();

  const handleCategoryClick = (categoryName) => {
    dispatch(setCategoryFilter(categoryName));
    dispatch(fetchFilteredProducts('', { min: null, max: null }, categoryName));
  };

  return (
    <div className="flex justify-center p-4">
      <div className="grid grid-cols-4 gap-16 max-w-4xl w-full">
        <a href="#section1" className="block mx-auto" onClick={() => handleCategoryClick('Relojes')}>
          <img
            src={reloj1}
            alt="Relojes"
            className="w-full h-auto object-cover rounded-full shadow-lg hover:opacity-75 transition duration-300"
          />
        </a>
        <a href="#section2" className="block mx-auto" onClick={() => handleCategoryClick('Manillas')}>
          <img
            src={anillo1}
            alt="Anillos"
            className="w-full h-auto object-cover rounded-full shadow-lg hover:opacity-75 transition duration-300"
          />
        </a>
        <a href="#section3" className="block mx-auto" onClick={() => handleCategoryClick('Anillos')}>
          <img
            src={anillo2}
            alt="Manillas"
            className="w-full h-auto object-cover rounded-full shadow-lg hover:opacity-75 transition duration-300"
          />
        </a>
        <a href="#section4" className="block mx-auto" onClick={() => handleCategoryClick('Cadenas')}>
          <img
            src={dije1}
            alt="Cadenas"
            className="w-full h-auto object-cover rounded-full shadow-lg hover:opacity-75 transition duration-300"
          />
        </a>
      </div>
    </div>
  );
};

export default SeccionIconosH;


  
