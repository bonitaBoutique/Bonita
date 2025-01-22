import React from 'react';
import { FaInstagram, FaEnvelope, FaFacebook } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa';

//AGREAGR MAPA / SISTECREDITO ADDY/ PAGOS CONTRAENTREGA Y LOS QUE ESTAN PERO MOVIENDSE
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="flex justify-center sm:justify-start space-x-4">
            <a
              href="https://www.instagram.com/bonitaboutiquecumaral/"
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition hover:scale-110"
            >
              <FaInstagram className="h-8 w-8 sm:h-10 sm:w-10 text-pink-500 hover:text-pink-400" />
            </a>
            <a
              href="https://www.facebook.com/bonitaboutique"
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition hover:scale-110"
            >
              <FaFacebook className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 hover:text-blue-500" />
            </a>
            <a
              href="https://www.tiktok.com/@bonitaboutique"
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition hover:scale-110"
            >
              <FaTiktok className="h-8 w-8 sm:h-10 sm:w-10 text-white hover:text-gray-300" />
            </a>
            <a 
              href="mailto:contact@example.com"
              className="transform transition hover:scale-110"
            >
              <FaEnvelope className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 hover:text-red-400" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



