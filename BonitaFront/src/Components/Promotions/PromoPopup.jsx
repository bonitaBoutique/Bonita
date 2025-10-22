/**
 * Componente: PromoPopup
 * Descripción: Banner/popup atractivo que muestra la promoción activa con imagen
 * Se muestra automáticamente cuando hay una promoción activa
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const PromoPopup = () => {
  const { activePromotion } = useSelector((state) => state.promotions);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!activePromotion) {
      setIsVisible(false);
      return;
    }

    // Verificar si el usuario ya cerró el popup en esta sesión
    const closedPromoId = sessionStorage.getItem('closedPromoId');
    
    if (closedPromoId === activePromotion.id_promotion.toString()) {
      setIsVisible(false);
      return;
    }

    // Mostrar el popup después de un pequeño delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [activePromotion]);

  const handleClose = () => {
    setIsClosing(true);
    
    // Guardar en sessionStorage para no mostrar de nuevo en esta sesión
    if (activePromotion) {
      sessionStorage.setItem('closedPromoId', activePromotion.id_promotion.toString());
    }

    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible || !activePromotion) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none transition-all duration-300 ${
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full pointer-events-auto transform transition-all relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Contenido del popup */}
          <div className="relative">
            {/* Imagen de la promoción */}
            {activePromotion.image_url ? (
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <img
                  src={activePromotion.image_url}
                  alt={activePromotion.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradiente overlay para mejor legibilidad */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Badge de descuento superpuesto */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg transform rotate-3">
                    <span className="text-3xl font-bold">
                      {activePromotion.discount_percentage}% OFF
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback si no hay imagen */
              <div className="relative h-48 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl font-bold mb-2">
                    {activePromotion.discount_percentage}%
                  </div>
                  <div className="text-2xl font-semibold">
                    DESCUENTO
                  </div>
                </div>
              </div>
            )}

            {/* Información de la promoción */}
            <div className="p-6 sm:p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                🎉 {activePromotion.title}
              </h2>
              
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {activePromotion.description}
              </p>

              {/* Fechas de vigencia */}
              {(activePromotion.start_date || activePromotion.end_date) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                    {activePromotion.start_date && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          Desde: <strong>{new Date(activePromotion.start_date).toLocaleDateString('es-CO', { 
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}</strong>
                        </span>
                      </div>
                    )}
                    
                    {activePromotion.end_date && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          Hasta: <strong>{new Date(activePromotion.end_date).toLocaleDateString('es-CO', { 
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Llamado a la acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  ¡Ver productos! 🛍️
                </button>
                
                <button
                  onClick={handleClose}
                  className="sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>

              {/* Nota adicional */}
              <p className="text-xs text-gray-500 text-center mt-4">
                * El descuento se aplica automáticamente a todos los productos
              </p>
            </div>
          </div>

          {/* Decoración animada */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 animate-pulse"></div>
        </div>
      </div>
    </>
  );
};

export default PromoPopup;
