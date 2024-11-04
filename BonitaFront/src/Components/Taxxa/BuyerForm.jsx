// BuyerForm.js

const BuyerForm = ({ jbuyer, setBuyer }) => {
    const handleChange = (e) => {
      const { name, value } = e.target;

      setBuyer((prevBuyer) => ({
        ...prevBuyer,
        [name]: value,
        sfiscalregime: name === 'wlegalorganizationtype' 
          ? value === 'company' 
            ? '48' // Persona jurídica
            : '49' // Persona natural
          : prevBuyer.sfiscalregime,
      }));

      if (name === 'sfiscalresponsibilitiesType') {
        switch (value) {
          case 'O1':
            setBuyer((prevBuyer) => ({
              ...prevBuyer,
              stributaryidentificationkey: '01',
              stributaryidentificationname: 'IVA',
            }));
            break;
          case 'O4':
            setBuyer((prevBuyer) => ({
              ...prevBuyer,
              stributaryidentificationkey: '04',
              stributaryidentificationname: 'INC',
            }));
            break;
          case 'ZA':
            setBuyer((prevBuyer) => ({
              ...prevBuyer,
              stributaryidentificationkey: 'ZA',
              stributaryidentificationname: 'IVA e INC',
            }));
            break;
          case 'R-99-PN':
            setBuyer((prevBuyer) => ({
              ...prevBuyer,
              stributaryidentificationkey: 'ZZ',
              stributaryidentificationname: 'No aplica',
            }));
            break;
          default:
            setBuyer((prevBuyer) => ({
              ...prevBuyer,
              stributaryidentificationkey: '',
              stributaryidentificationname: '',
            }));
            break;
        }
      }
    };

    return (
      <>
        <label>
          Nombre/Razón Social:
          <input type="text" name="scostumername" value={jbuyer.scostumername} onChange={handleChange} />
        </label>
        <label>
          Tipo de Organización:
          <select name="wlegalorganizationtype" value={jbuyer.wlegalorganizationtype} onChange={handleChange}>
            <option value="person">Persona Natural</option>
            <option value="company">Persona Jurídica</option>
          </select>
        </label>
        <label>
          Responsabilidad Fiscal:
          <select name="sfiscalresponsibilities" value={jbuyer.sfiscalresponsibilities} onChange={handleChange}>
            <option value="O-13">Gran contribuyente</option>
            <option value="O-15">Autorretenedor</option>
            <option value="O-23">Agente de retención IVA</option>
            <option value="O-47">Régimen simple de tributación</option>
            <option value="R-99-PN">No aplica – Otros *</option>
          </select>
        </label>
        <label>
          Identificación Tributaria:
          <select name="sfiscalresponsibilitiesType" value={jbuyer.sfiscalresponsibilitiesType} onChange={handleChange}>
            <option value="O1">IVA</option>
            <option value="O4">INC</option>
            <option value="ZA">IVA e INC</option>
            <option value="R-99-PN">No aplica</option>
          </select>
        </label>
        <label>
          Tipo de Documento:
          <select name="wdoctype" value={jbuyer.wdoctype} onChange={handleChange}>
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
        </label>
      </>
    );
};

export default BuyerForm;

  
