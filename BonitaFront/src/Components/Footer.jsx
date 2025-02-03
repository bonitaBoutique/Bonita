import React from 'react';
import { FaInstagram, FaEnvelope, FaFacebook } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa';
import mapa from '../assets/img/mapa.png';


const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-8">
          {/* Social Icons */}
          <div className="flex justify-center space-x-6">
            <a
              href="https://www.instagram.com/bonitaboutiquecumaral/"
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition hover:scale-110"
            >
              <FaInstagram className="h-8 w-8 sm:h-10 sm:w-10 text-pink-500 hover:text-pink-400" />
            </a>
            <a
              href="https://www.facebook.com/bonitaboutiquecumaral/"
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition hover:scale-110"
            >
              <FaFacebook className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 hover:text-blue-500" />
            </a>
            <a
              href="https://www.tiktok.com/@bonitaboutiquecumaral"
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition hover:scale-110"
            >
              <FaTiktok className="h-8 w-8 sm:h-10 sm:w-10 text-white hover:text-gray-300" />
            </a>
          
          </div>

          {/* Map Image */}
          <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img 
                src={mapa} 
                alt="Ubicación de la tienda" 
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                <p className="text-sm">Calle 12 # 17 -57 Local 3 y 4, Cumaral </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Bonita Boutique. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



