import React from 'react';
import PropTypes from 'prop-types';

const ShippingOptionsPopup = ({ onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Selecciona el método de entrega
        </h3>
        <div className="space-y-4">
          <button
            onClick={() => onSelect('pickup')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retira en Local
          </button>
          <button
            disabled
            className="w-full px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed opacity-70"
          >
            Muy pronto envíos a domicilio
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

ShippingOptionsPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ShippingOptionsPopup;
