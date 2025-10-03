import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserByDocument } from "../../Redux/Actions/actions";
import BuyerForm from "./BuyerForm";
import UserRegistrationPopup from "./UserRegistrationPopup";
import { useNavigate } from "react-router-dom";

const BillingFormModal = ({ isOpen, onClose, orderData }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userTaxxa = useSelector((state) => state.userTaxxa);

  const [n_document, setNDocument] = useState("");
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState("01"); // "01" = Factura, "91" = Nota Crédito
  const [jbuyer, setBuyer] = useState({
    wlegalorganizationtype: "person",
    scostumername: "Consumidor Final",
    stributaryidentificationkey: "01",
    stributaryidentificationname: "IVA",
    sfiscalresponsibilities: "R-99-PN",
    sfiscalregime: "49",
    jpartylegalentity: {
      wdoctype: "",
      sdocno: "",
      scorporateregistrationschemename: ""
    },
    jcontact: {
      scontactperson: "",
      selectronicmail: "",
      stelephone: "",
      jregistrationaddress: {
        scountrycode: "CO",
        wdepartmentcode: "",
        wtowncode: "",
        scityname: "",
        saddressline1: "",
        szip: ""
      }
    }
  });

  // ✅ Autocargar datos del cliente cuando se recibe orderData
  useEffect(() => {
    if (orderData && orderData.n_document) {
      console.log('📋 [BillingFormModal] Cargando datos del pedido:', orderData);
      setNDocument(orderData.n_document);
      dispatch(fetchUserByDocument(orderData.n_document));
    }
  }, [orderData, dispatch]);

  // ✅ Actualizar buyer cuando se carga el usuario
  useEffect(() => {
    if (userTaxxa.userInfo && userTaxxa.userInfo.error) {
      setShowRegistrationPopup(true);
    } else if (userTaxxa.userInfo) {
      const {
        first_name,
        last_name,
        email,
        phone,
        n_document,
        wlegalorganizationtype,
        scostumername,
        stributaryidentificationkey,
        sfiscalregime,
        sfiscalresponsibilities,
        wdoctype,
        wdepartmentcode,
        wtowncode,
        scityname,
        saddressline1,
        szip
      } = userTaxxa.userInfo;

      setBuyer((prevBuyer) => ({
        ...prevBuyer,
        wlegalorganizationtype: wlegalorganizationtype || "person",
        scostumername:
          scostumername ||
          `${first_name} ${last_name}`.trim() ||
          "Consumidor Final",
        stributaryidentificationkey: stributaryidentificationkey || "01",
        stributaryidentificationname: "IVA",
        sfiscalresponsibilities: sfiscalresponsibilities || "R-99-PN",
        sfiscalregime: sfiscalregime || "49",
        jpartylegalentity: {
          wdoctype: wdoctype || "",
          sdocno: n_document || "",
          scorporateregistrationschemename: `${first_name} ${last_name}`.trim() || ""
        },
        jcontact: {
          scontactperson: `${first_name} ${last_name}`.trim() || "",
          selectronicmail: email || "",
          stelephone: phone || "",
          jregistrationaddress: {
            scountrycode: "CO",
            wdepartmentcode: wdepartmentcode || "50",
            wtowncode: wtowncode || "50226",
            scityname: scityname || "Cumaral",
            saddressline1: saddressline1 || "12 # 17 -57",
            szip: szip || "501021"
          }
        }
      }));
    }
  }, [userTaxxa]);

  const handleFetchUser = (e) => {
    e.preventDefault();
    dispatch(fetchUserByDocument(n_document));
  };

  const handleProceedToInvoice = () => {
    if (jbuyer.scostumername === "Consumidor Final" || !jbuyer.jcontact.selectronicmail) {
      alert("Por favor completa los datos del comprador antes de continuar.");
      return;
    }

    // Navegar con datos del buyer y del pedido
    const dataToSend = {
      buyer: jbuyer,
      order: orderData
    };

    if (selectedDocumentType === "01") {
      console.log("📄 [BillingFormModal] Navegando a Invoice con datos:", dataToSend);
      navigate("/invoice", { state: dataToSend });
    } else if (selectedDocumentType === "91") {
      console.log("📄 [BillingFormModal] Navegando a Credit Note con datos:", dataToSend);
      navigate("/creditN", { state: dataToSend });
    }

    onClose(); // Cerrar el modal después de navegar
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg flex justify-between items-center z-10">
            <div>
              <h2 className="text-2xl font-bold">📋 Datos del Comprador</h2>
              {orderData && (
                <p className="text-sm opacity-90 mt-1">
                  Orden: {orderData.id_orderDetail} | Cliente: {orderData.n_document}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-3xl font-bold"
              title="Cerrar"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Búsqueda de usuario */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">🔍 Buscar Cliente</h3>
              <form onSubmit={handleFetchUser} className="flex gap-3">
                <input
                  type="text"
                  value={n_document}
                  onChange={(e) => setNDocument(e.target.value)}
                  placeholder="Número de documento"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  disabled={userTaxxa.loading}
                >
                  {userTaxxa.loading ? "🔄 Buscando..." : "Buscar"}
                </button>
              </form>
              {userTaxxa.error && (
                <p className="text-red-500 mt-2 text-sm">⚠️ {userTaxxa.error}</p>
              )}
            </div>

            {/* Formulario del comprador */}
            <div className="mb-6">
              <BuyerForm jbuyer={jbuyer} setBuyer={setBuyer} />
            </div>

            {/* Selector de tipo de documento */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">📄 Tipo de Comprobante</h3>
              <div className="flex gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="documentType"
                    value="01"
                    checked={selectedDocumentType === "01"}
                    onChange={(e) => setSelectedDocumentType(e.target.value)}
                    className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-800 font-medium">
                    📄 Factura Electrónica
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="documentType"
                    value="91"
                    checked={selectedDocumentType === "91"}
                    onChange={(e) => setSelectedDocumentType(e.target.value)}
                    className="w-5 h-5 text-orange-600 focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-gray-800 font-medium">
                    📋 Nota de Crédito
                  </span>
                </label>
              </div>
            </div>

            {/* Información del importe a facturar */}
            {orderData && (
              <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">💰 Importe a Facturar</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monto original de la orden:</p>
                    <p className="text-lg font-bold text-gray-700">
                      ${orderData.amount?.toLocaleString("es-CO")}
                    </p>
                  </div>
                  {orderData.receipt_info?.total_amount && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Importe facturado (con descuento):</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${orderData.receipt_info.total_amount.toLocaleString("es-CO")}
                      </p>
                      {orderData.amount !== orderData.receipt_info.total_amount && (
                        <p className="text-xs text-orange-600 mt-1">
                          Descuento: ${(orderData.amount - orderData.receipt_info.total_amount).toLocaleString("es-CO")}
                        </p>
                      )}
                    </div>
                  )}
                  {!orderData.receipt_info && (
                    <div className="text-right">
                      <p className="text-sm text-yellow-600 italic">⚠️ Sin recibo asociado</p>
                      <p className="text-xs text-gray-500">Se facturará el monto de la orden</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer con acciones */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleProceedToInvoice}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              {selectedDocumentType === "01" ? "📄 Ir a Factura" : "📋 Ir a Nota Crédito"}
              →
            </button>
          </div>

          {/* Popup de registro si el usuario no existe */}
          {showRegistrationPopup && (
            <UserRegistrationPopup onClose={() => setShowRegistrationPopup(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingFormModal;
