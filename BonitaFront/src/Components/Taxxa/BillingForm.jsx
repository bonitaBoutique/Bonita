import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserByDocument } from "../../Redux/Actions/actions";
import BuyerForm from "./BuyerForm";
import UserRegistrationPopup from "./UserRegistrationPopup";
import DocumentTypePopup from "./DocumentTypePopup"; // Importa el popup

const BillingForm = () => {
  const [n_document, setNDocument] = useState("");
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false); // Estado para el popup
  const [jbuyer, setBuyer] = useState({
    wlegalorganizationtype: "",
    scostumername: "",
    stributaryidentificationkey: "",
    stributaryidentificationname: "",
    sfiscalresponsibilities: "",
    sfiscalregime: "",
    jpartylegalentity: {
      wdoctype: "",
      sdocno: "",
      scorporateregistrationschemename: "",
    },
    jcontact: {
      scontactperson: "",
      selectronicmail: "",
      stelephone: "",
    },
  });

  const handleProceedToDocument = () => {
    if (jbuyer.scostumername === "CONSUMIDOR FINAL") {
      alert("Completa los datos del comprador antes de continuar.");
      return;
    }
    setShowInvoicePopup(true); // Abrir el popup para seleccionar el tipo de comprobante
  };

  const dispatch = useDispatch();
  const userTaxxa = useSelector((state) => state.userTaxxa);

  const handleFetchUser = (e) => {
    e.preventDefault();
    dispatch(fetchUserByDocument(n_document));
  };

  useEffect(() => {
    if (userTaxxa.userInfo && userTaxxa.userInfo.error) {
      setShowRegistrationPopup(true);
    } else if (userTaxxa.userInfo && userTaxxa.userInfo.data) {
      const { first_name, last_name, email, phone, n_document } =
        userTaxxa.userInfo.data;
      setBuyer((prevBuyer) => ({
        ...prevBuyer,
        scostumername: `${first_name} ${last_name}`.trim(),
        jpartylegalentity: {
          ...prevBuyer.jpartylegalentity,
          sdocno: n_document || "",
          scorporateregistrationschemename: `${first_name} ${last_name}`.trim(),
        },
        jcontact: {
          scontactperson: `${first_name} ${last_name}`.trim(),
          selectronicmail: email || "",
          stelephone: phone || "",
        },
      }));
    }
  }, [userTaxxa]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(jbuyer); // Aquí enviarías `jbuyer` al backend con la estructura solicitada
  };

  const closePopup = () => setShowRegistrationPopup(false);

  return (
    <div className="p-6 max-w-lg mx-auto pt-40 grid-cols-4">
      <form onSubmit={handleFetchUser} className="flex flex-col gap-4 mb-6">
        <label className="text-gray-700">Número de Documento</label>
        <input
          type="text"
          value={n_document}
          onChange={(e) => setNDocument(e.target.value)}
          className="p-2 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Buscar Usuario
        </button>
      </form>

      {userTaxxa.error && <p className="text-red-500 mt-2">{userTaxxa.error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <BuyerForm jbuyer={jbuyer} setBuyer={setBuyer} />
       
      </form>

      {showRegistrationPopup && <UserRegistrationPopup onClose={closePopup} />}
      <button
        type="button"
        onClick={handleProceedToDocument}
        className="bg-blue-500 text-white py-2 rounded mt-12 hover:bg-blue-600"
      >
        Proceder a Facturar o Nota de Crédito
      </button>

      {/* Popup para seleccionar tipo de comprobante */}
      {showInvoicePopup && (
        <DocumentTypePopup
          onClose={() => setShowInvoicePopup(false)}
          onSubmit={(type) => console.log("Tipo de comprobante seleccionado:", type)}
        />
      )}
    </div>
  );
};

export default BillingForm;













