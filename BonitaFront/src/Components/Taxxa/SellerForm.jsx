/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerData, updateSellerData } from '../../Redux/Actions/actions';
import { useNavigate } from 'react-router-dom';


const SellerForm = ({ jseller, setSeller }) => {
  const dispatch = useDispatch();
  const sellerData = useSelector((state) => state.sellerData.data);
  console.log(sellerData);

 const navigate = useNavigate();

  const [formData, setFormData] = useState({
    wlegalorganizationtype: "",
    sfiscalresponsibilities: "",
    sdocno: "",
    sdoctype: "",
    ssellername: "",
    ssellerbrand: "",
    scontactperson: "",
    saddresszip: "",
    wdepartmentcode: "",
    wtowncode: "",
    scityname: "",
    selectronicmail: "",
    registration_wdepartmentcode: "",
    registration_scityname: "",
    registration_saddressline1: "",
    registration_scountrycode: "",
    registration_wprovincecode: "",
    registration_szip: "",
    registration_sdepartmentname: ""
  });

  useEffect(() => {
    dispatch(fetchSellerData());
    console.log('fetchSellerData ejecutado'); // Confirmación de la acción
  }, [dispatch]);

  useEffect(() => {
    if (sellerData) {
      console.log('Datos del vendedor cargados:', sellerData); // Verifica los datos iniciales
      setFormData(sellerData);
    }
  }, [sellerData]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Datos enviados:', formData); // Verifica el objeto antes de enviarlo
    
    if (sellerData && sellerData.id) {
      const success = await dispatch(updateSellerData(sellerData.id, formData));
      if (success) {
        alert("Datos actualizados con éxito");
        navigate("/panel");
      } else {
        alert("Error al actualizar los datos");
      }
    }
  };
  
  
  const handleChange = (e) => {
    const updatedFormData = { ...formData, [e.target.name]: e.target.value };
    console.log(`Cambio en el campo ${e.target.name}:`, updatedFormData); // Verifica cada cambio
    setFormData(updatedFormData);
  };
  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-3xl mx-auto bg-white shadow-lg mt-32 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Datos del Comercio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Tipo de Organización Legal:
          </label>
          <select
            name="wlegalorganizationtype"
            value={formData.wlegalorganizationtype}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="person">Persona Natural</option>
            <option value="company">Persona Jurídica</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Responsabilidad Fiscal:
          </label>
          <select
            name="sfiscalresponsibilities"
            value={formData.sfiscalresponsibilities}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="R-99-PN">No aplica – Otros *</option>
            <option value="O1">IVA</option>
            <option value="O4">INC</option>
            <option value="ZA">IVA e INC</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Número de Documento:
          </label>
          <input
            type="text"
            name="sdocno"
            value={formData.sdocno}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Tipo de Documento:
          </label>
          <select
            name="sdoctype"
            value={formData.sdoctype}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Selecciona un tipo de documento</option>
            <option value="RC">Registro civil</option>
            <option value="TI">Tarjeta de identidad</option>
            <option value="CC">Cédula de ciudadanía</option>
            <option value="TE">Tarjeta de extranjería</option>
            <option value="CE">Cédula de extranjería</option>
            <option value="NIT">NIT</option>
            <option value="PAS">Pasaporte</option>
            <option value="DEX">Documento de identificación extranjero</option>
            <option value="PEP">PEP (Permiso Especial de Permanencia)</option>
            <option value="PPT">PPT (Permiso Protección Temporal)</option>
            <option value="FI">NIT de otro país</option>
            <option value="NUIP">NUIP</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Razón Social del Vendedor:</label>
          <input
            type="text"
            name="ssellername"
            value={formData.ssellername}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Resto de campos, todos con el mismo estilo */}
        {/* Ejemplo de un campo adicional */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nombre Comercial:</label>
          <input
            type="text"
            name="ssellerbrand"
            value={formData.ssellerbrand}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Continúa con otros campos siguiendo el mismo patrón */}
        
      </div>

      <button
        type="submit"
        className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-200"
      >
        Guardar Cambios
      </button>
    </form>
  );
};

export default SellerForm;


