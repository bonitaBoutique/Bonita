import React from 'react';
import { FaInstagram, FaEnvelope } from 'react-icons/fa';


//AGREAGR MAPA / SISTECREDITO ADDY/ PAGOS CONTRAENTREGA Y LOS QUE ESTAN PERO MOVIENDSE
const Footer = () => {
  return (
    <footer id='footer' className="bg-gray-200 text-gray-800 py-6">
      {/* Sección de links */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 text-center sm:text-left">
          {/* Navegación */}
          <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0">
            <a href="#" className="hover:underline font-nunito text-sm">
              Lo nuevo
            </a>
            <a href="#" className="hover:underline font-nunito text-sm">
              Colecciones
            </a>
            <a href="#" className="hover:underline font-nunito text-sm">
              Categorías
            </a>
            
            <a href="#" className="hover:underline font-nunito text-sm">
              Términos y Condiciones
            </a>
          </div>

          {/* Íconos sociales */}
          <div className="flex justify-center sm:justify-start space-x-6">
            <a
              href="https://www.instagram.com/bonitaboutiquecumaral/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram className="h-6 w-6 sm:h-8 sm:w-8 hover:text-gray-500" />
            </a>
            <a href="mailto:contact@example.com">
              <FaEnvelope className="h-6 w-6 sm:h-8 sm:w-8 hover:text-gray-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-300 text-gray-600 text-sm text-center py-3 mt-6">
        © {new Date().getFullYear()} Bonita. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;




