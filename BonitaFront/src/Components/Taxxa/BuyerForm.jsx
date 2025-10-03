import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const BuyerForm = ({ jbuyer, setBuyer }) => {
  useEffect(() => {
    setBuyer(prevBuyer => ({
      ...prevBuyer,
      jcontact: {
        ...prevBuyer.jcontact,
        jregistrationaddress: {
          ...prevBuyer.jcontact.jregistrationaddress,
          scountrycode: "CO",
          wdepartmentcode: "50",
          wtowncode: "50226",
          scityname: "Cumaral",
          saddressline1: "12 # 17 -57",
          szip: "501021"
        }
      }
    }));
  }, []);


  const handleChange = (e) => {
  const { name, value } = e.target;

  setBuyer((prevBuyer) => {
    let updatedBuyer = { ...prevBuyer };

    // Handle address fields separately
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      updatedBuyer.jcontact.jregistrationaddress = {
        ...updatedBuyer.jcontact.jregistrationaddress,
        [addressField]: value
      };
      return updatedBuyer;
    }

    // Handle other fields
    if (name in updatedBuyer) {
      updatedBuyer[name] = value;
    } else if (name in updatedBuyer.jpartylegalentity) {
      updatedBuyer.jpartylegalentity[name] = value;
    } else if (name in updatedBuyer.jcontact) {
      updatedBuyer.jcontact[name] = value;
    }

    // Handle special cases
    if (name === 'wlegalorganizationtype') {
      updatedBuyer.sfiscalregime = value === 'company' ? '48' : '49';
    }

    if (name === 'sfiscalresponsibilities') {
      switch (value) {
        case 'O1':
          updatedBuyer.stributaryidentificationkey = '01';
          updatedBuyer.stributaryidentificationname = 'IVA';
          break;
        case 'O4':
          updatedBuyer.stributaryidentificationkey = '04';
          updatedBuyer.stributaryidentificationname = 'INC';
          break;
        case 'ZA':
          updatedBuyer.stributaryidentificationkey = 'ZA';
          updatedBuyer.stributaryidentificationname = 'IVA e INC';
          break;
        case 'R-99-PN':
          updatedBuyer.stributaryidentificationkey = 'ZZ';
          updatedBuyer.stributaryidentificationname = 'No aplica';
          break;
        default:
          updatedBuyer.stributaryidentificationkey = '';
          updatedBuyer.stributaryidentificationname = '';
          break;
      }
    }

    console.log('Updated Buyer:', updatedBuyer);
    return updatedBuyer;
  });
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-1">
          Nombre/Razón Social:
        </label>
        <input 
          type="text" 
          name="scostumername" 
          value={jbuyer.scostumername} 
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Ingrese nombre o razón social"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-1">
          Tipo de Organización:
        </label>
        <select 
          name="wlegalorganizationtype" 
          value={jbuyer.wlegalorganizationtype} 
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
        >
          <option value="person">Persona Natural</option>
          <option value="company">Persona Jurídica</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-1">
          Responsabilidad Fiscal:
        </label>
        <select 
          name="sfiscalresponsibilities" 
          value={jbuyer.sfiscalresponsibilities} 
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
        >
          <option value="R-99-PN">No aplica – Otros *</option>
          <option value="O1">IVA</option>
          <option value="O4">INC</option>
          <option value="ZA">IVA e INC</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-1">
          Tipo de Documento:
        </label>
        <select 
          name="wdoctype" 
          value={jbuyer.jpartylegalentity.wdoctype} 
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
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

      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-1">
          Número de Documento:
        </label>
        <input 
          type="text" 
          name="sdocno" 
          value={jbuyer.jpartylegalentity.sdocno} 
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Ingrese número de documento"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-1">
          Persona de Contacto:
        </label>
        <input 
          type="text" 
          name="scontactperson" 
          value={jbuyer.jcontact.scontactperson} 
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Nombre de la persona de contacto"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-1">
          Correo Electrónico:
        </label>
        <input 
          type="email" 
          name="selectronicmail" 
          value={jbuyer.jcontact.selectronicmail} 
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-1">
          Teléfono:
        </label>
        <input 
          type="text" 
          name="stelephone" 
          value={jbuyer.jcontact.stelephone} 
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="3001234567"
        />
      </div>
    </div>
  );
};
BuyerForm.propTypes = {
  jbuyer: PropTypes.shape({
    scostumername: PropTypes.string,
    wlegalorganizationtype: PropTypes.string,
    sfiscalresponsibilities: PropTypes.string,
    jpartylegalentity: PropTypes.shape({
      wdoctype: PropTypes.string,
      sdocno: PropTypes.string,
    }),
    jcontact: PropTypes.shape({
      scontactperson: PropTypes.string,
      selectronicmail: PropTypes.string,
      stelephone: PropTypes.string,
      jregistrationaddress: PropTypes.shape({
        scountrycode: PropTypes.string,
        wdepartmentcode: PropTypes.string,
        wtowncode: PropTypes.string,
        scityname: PropTypes.string,
        saddressline1: PropTypes.string,
        szip: PropTypes.string
      })
    }),
  }).isRequired,
  setBuyer: PropTypes.func.isRequired,
};

export default BuyerForm;


  
