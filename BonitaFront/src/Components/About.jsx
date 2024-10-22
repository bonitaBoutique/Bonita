import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { setCategoryFilter, fetchFilteredProducts } from '../Redux/Actions/actions';
import aboutimg from '../assets/img/about.png';
import aznara from "../assets/img/logoCompleto.png";
import reloj1 from "../assets/img/reloj1.png";
import manillas from "../assets/img/anillo1.png";
import anillos from "../assets/img/anillo2.png";
import cadenas from "../assets/img/dije1.png";

const About = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleCategoryClick = (categoryName) => {
    // Actualiza el filtro de categoría en el store
    dispatch(setCategoryFilter(categoryName));
    dispatch(fetchFilteredProducts('', { min: null, max: null }, categoryName));

    // Redirige a la página de productos de la categoría
    navigate(`/productsCat/${categoryName}`); // Cambia la URL
  };

  return (
    <>
      <div className="relative bg-cover bg-center h-[64rem]" style={{ backgroundImage: `url(${aboutimg})` }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-4xl mx-auto h-full flex items-center p-8 -ml-2 mt-16">
          <div className="text-gray-400 mt-20">
            <h2 className="text-6xl font-bold mb-4 font-nunito">Sobre Nosotros</h2>
            <span className="text-2xl font-semibold leading-relaxed font-nunito">
              Durante los últimos 3 años, el equipo de Aznara Store<br></br> se ha dedicado a brindar un servicio excepcional,
              <br></br> asegurándonos de satisfacer las necesidades de nuestros clientes
              y agregar valor a sus solicitudes en todo momento.
            </span>
          </div>
        </div>
      </div>
      <div id="about"   className="bg-colorFooter h-[16rem] mt-10 flex justify-around items-center">
        <div className="text-center">
          <a href="#section1" className="block mx-auto">
            <img src={aznara} alt="Logo 1" className="w-32 h-32 object-cover mx-auto" />
            <p className="text-white mt-2 font-nunito font-semibold">Marca Tu Estilo</p>
          </a>
        </div>
        <div className="text-center">
          <a className="block mx-auto" onClick={() => handleCategoryClick('Relojes')}>
            <img src={reloj1} alt="Logo 2" className="w-32 h-32 object-cover mx-auto" />
            <p className="text-white mt-2 font-nunito font-semibold">Relojes</p>
          </a>
        </div>
        <div className="text-center">
          <a className="block mx-auto" onClick={() => handleCategoryClick('Manillas')}>
            <img src={manillas} alt="Logo 3" className="w-32 h-32 rounded-full object-cover mx-auto" />
            <p className="text-white mt-2 font-nunito font-semibold">Manillas</p>
          </a>
        </div>
        <div className="text-center">
          <a className="block mx-auto" onClick={() => handleCategoryClick('Anillos')}>
            <img src={anillos} alt="Logo 4" className="w-32 h-32 object-cover mx-auto" />
            <p className="text-white mt-2 font-nunito font-semibold">Anillos</p>
          </a>
        </div>
        <div className="text-center">
          <a className="block mx-auto" onClick={() => handleCategoryClick('Cadenas')}>
            <img src={cadenas} alt="Logo 5" className="w-32 h-32 rounded-full object-cover mx-auto" />
            <p className="text-white mt-2 font-nunito font-semibold">Cadenas</p>
          </a>
        </div>
      </div>
    </>
  );
};

export default About;


