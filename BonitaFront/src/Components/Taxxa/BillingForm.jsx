// BillingForm.js

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserByDocument } from '../../Redux/Actions/actions';
import BuyerForm from './BuyerForm';
import UserRegistrationPopup from './UserRegistrationPopup';

const BillingForm = () => {
  const [n_document, setNDocument] = useState('');
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [jbuyer, setBuyer] = useState({
    wlegalorganizationtype: '',
    scostumername: '',
    sfiscalresponsibilities: '',
    stributaryidentificationkey: '',
    stributaryidentificationname: '',
    sfiscalregime: '',
    wdoctype: '',
    sdocno: '', // Este campo se llenará con n_document
    scorporateregistrationschemename: '',
    scontactperson: '',
    selectronicmail: '',
    stelephone: '',
    saddressline1: '',
    wdepartmentcode: '',
    sdepartmentname: '',
    wprovincecode: '',
    scityname: '',
    szip: '',
  });

  const dispatch = useDispatch();
  const userTaxxa = useSelector((state) => state.userTaxxa);

  const handleFetchUser = (e) => {
    e.preventDefault();
    dispatch(fetchUserByDocument(n_document));
  };

  useEffect(() => {
    if (userTaxxa.userInfo.error) {
      setShowRegistrationPopup(true);
    } else if (userTaxxa.userInfo.data) {
      const { first_name, last_name, email, phone, city, n_document } = userTaxxa.userInfo.data;
      setBuyer((prevBuyer) => ({
        ...prevBuyer,
        scostumername: `${first_name} ${last_name}`.trim(),
        scorporateregistrationschemename: `${first_name} ${last_name}`.trim(),
        selectronicmail: email || '',
        stelephone: phone || '',
        scityname: city || '',
        sdocno: n_document || '', // Asigna n_document a sdocno
        
      }));
    }
  }, [userTaxxa]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(jbuyer); // Aquí enviarías `jbuyer` al backend
  };

  const closePopup = () => setShowRegistrationPopup(false);

  return (
    <div className="p-6 max-w-lg mx-auto pt-80 grid-cols-4">
      <form onSubmit={handleFetchUser} className="flex flex-col gap-4 mb-6">
        <label className="text-gray-700">Número de Documento</label>
        <input
          type="text"
          value={n_document}
          onChange={(e) => setNDocument(e.target.value)}
          className="p-2 border border-gray-300 rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Buscar Usuario
        </button>
      </form>

      {userTaxxa.error && <p className="text-red-500 mt-2">{userTaxxa.error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <BuyerForm jbuyer={jbuyer} setBuyer={setBuyer} />
        <button type="submit" className="bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Enviar Factura
        </button>
      </form>

      {showRegistrationPopup && <UserRegistrationPopup onClose={closePopup} />}
    </div>
  );
};

export default BillingForm;










