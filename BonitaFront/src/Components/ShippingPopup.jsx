import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { createSending } from '../Redux/Actions/actions'; // Importa la action createSending
import PropTypes from 'prop-types';


const ShippingPopup = ({ isShippingPopupOpen, onClose, id_orderDetail }) => {
  const [formData, setFormData] = useState({
    receiver: {
      cellPhone: "",
      destinationAddress: "",
      email: "",
      name: "",
      nit: ".",
      nitType: ".",
      prefix: "+57",
      surname: "."
    },
    locate: {
      destinyDaneCode: "20000",
      originDaneCode: "50226",
      originCountryCode: "170",
      destinyCountryCode: "170"
    }
  });
  const [isLoading, setIsLoading] = useState(false); // Estado para mostrar el mensaje de carga
  const dispatch = useDispatch(); // Obtiene la función dispatch de Redux

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Muestra el mensaje de carga

    const shippingData = {
      adminTransactionData: { saleValue: 0 },
      channel: "Test API",
      comments: "notas del pedidooo",
      criteria: "price",
      deliveryCompany: "653928ae0a945520b78f279b",
      description: "notas del pedidooo",
      locate: formData.locate,
      paymentType: 101,
      productInformation: {
        declaredValue: 10000,
        forbiddenProduct: true,
        height: 10,
        large: 10,
        productReference: "-",
        quantity: 1,
        weight: 1,
        width: 10
      },
      receiver: formData.receiver,
      requestPickup: "false",
      sender: {
        cellPhone: "3000000000",
        email: "pruebasmipaqueteoficial@gmail.com",
        name: "sebastian meneses",
        nit: "1036638301",
        nitType: "NIT",
        pickupAddress: "reterterterterter",
        prefix: "+57",
        surname: "."
      },
      id_orderDetail: id_orderDetail // Agrega el id_orderDetail a los datos de envío
    };

    try {
      await dispatch(createSending(shippingData)); // Llama a la action createSending
      Swal.fire({
        title: 'Éxito',
        text: 'Envío creado correctamente',
        icon: 'success'
      });
      onClose(); // Cierra el popup
    } catch (error) {
      console.error('Error al crear el envío:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al crear el envío',
        icon: 'error'
      });
    } finally {
      setIsLoading(false); // Oculta el mensaje de carga
    }
  };

  if (!isShippingPopupOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Datos de Envío</h2>
        <form onSubmit={handleSubmit}>
          {/* Campo oculto para el id_orderDetail */}
          <input type="hidden" name="id_orderDetail" value={id_orderDetail} />
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="text"
                name="receiver.cellPhone"
                value={formData.receiver.cellPhone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                type="text"
                name="receiver.destinationAddress"
                value={formData.receiver.destinationAddress}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="receiver.email"
                value={formData.receiver.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="receiver.name"
                value={formData.receiver.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              disabled={isLoading} // Deshabilita el botón mientras se está cargando
            >
              {isLoading ? 'Cargando...' : 'Confirmar'} {/* Muestra el mensaje de carga */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


ShippingPopup.propTypes = {
  isShippingPopupOpen: PropTypes.bool.isRequired, // Valida que isShippingPopupOpen sea de tipo booleano y requerido
  onClose: PropTypes.func.isRequired,
  id_orderDetail: PropTypes.string.isRequired,
};
export default ShippingPopup;