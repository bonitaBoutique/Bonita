import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import {
  fetchLatestReceipt,
  createReceipt,
  fetchUserByDocument, // Asegúrate que esta acción actualiza el estado Redux
  resetReceiptState,
} from "../Redux/Actions/actions";
import axios from "axios"; // Asegúrate de tener axios instalado y configurado
import { BASE_URL } from "../Config"; // Asegúrate que BASE_URL esté definida y exportada

const GiftCard = () => {
  const { n_document } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Estados locales del formulario
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [amount, setAmount] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [date, setDate] = useState("");
  const [actualPaymentMethod, setActualPaymentMethod] = useState("Efectivo"); // Estado para el método de pago REAL

  // Ya no necesitamos loadingClient/clientError local, usaremos los del store

  // Selectors de Redux
  const { receiptNumber } = useSelector((state) => state);
  const {
    userInfo: cashierInfo,
    loading: cashierLoading, // Loading del cajero
    error: cashierError,     // Error del cajero
  } = useSelector((state) => state.userTaxxa || {});

  // Selector para los detalles del cliente (ajusta 'clientDetails' según tu store)
  const {
    userInfo: clientData,    // Renombrado para claridad (datos del cliente)
    loading: clientLoading,  // Renombrado para claridad
    error: clientError,      // Renombrado para claridad
  } = useSelector((state) => state.userTaxxa || { userInfo: null, loading: false, error: null });

  // Efecto para DESPACHAR la carga del cliente
  useEffect(() => {
    if (n_document) {
      dispatch(fetchUserByDocument(n_document)); // Solo despacha, no uses .then() aquí
      setDate(new Date().toISOString().slice(0, 10));
    } else {
      // Considera mostrar un error o redirigir si no hay n_document
      console.error("No se proporcionó documento del cliente.");
      // Podrías establecer un error local o usar el estado de Redux si prefieres
    }
  }, [n_document, dispatch]);

  // Efecto para ACTUALIZAR el estado local CUANDO los datos del cliente cambian en Redux
  useEffect(() => {
    if (clientData) {
      setBuyerName(`${clientData.first_name || ""} ${clientData.last_name || ""}`);
      setBuyerEmail(clientData.email || "");
      setBuyerPhone(clientData.phone || "");
    } else {
      // Opcional: Limpiar si clientData se vuelve null/undefined
      setBuyerName("");
      setBuyerEmail("");
      setBuyerPhone("");
    }
  }, [clientData]); // Este efecto se ejecuta cuando clientData (del store) cambia

  // Cargar último número de recibo (sin cambios)
  useEffect(() => {
    if (receiptNumber === undefined || receiptNumber === null) { // Verifica si realmente necesita cargarse
      dispatch(fetchLatestReceipt());
    }
  }, [dispatch, receiptNumber]);

  // Cargar info del cajero (sin cambios, asumiendo que userTaxxa se carga en otro lugar o ya está)
  // useEffect(() => { ... }, [cashierInfo, dispatch]); // Puedes mantenerlo si es necesario

  const resetForm = () => {
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setIsSubmitted(false);
  };

  const handleExit = () => {
    dispatch(resetReceiptState());
    navigate("/panel/caja");
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();

    // Validar que los datos del cliente se hayan cargado
    if (!buyerName || !buyerEmail) {
       Swal.fire("Error", "No se pudieron cargar los datos del cliente.", "error");
       return;
    }
    if (!amount || Number(amount) <= 0 || !date) {
      Swal.fire("Error", "Completa el Monto y la Fecha.", "error");
      return;
    }
     if (!cashierInfo?.n_document) {
       Swal.fire("Error", "No se pudo identificar al cajero.", "error");
       return;
     }
     if (!actualPaymentMethod) { // Validar que se seleccionó un método de pago real
        Swal.fire("Error", "Selecciona cómo se pagó la GiftCard.", "error");
        return;
      }


    const receiptData = {
    total_amount: parseFloat(amount),
    date,
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    buyer_phone: buyerPhone,
    payMethod: "GiftCard",
    amount: Number(amount),
    cashier_document: cashierInfo?.n_document,
    actualPaymentMethod: actualPaymentMethod,
  };

  try {
    // Captura la respuesta del dispatch
    const receiptResponse = await dispatch(createReceipt(receiptData));
    setIsSubmitted(true);

    // Obtén el id del recibo recién creado
    const createdReceipt = receiptResponse?.payload?.receipt || receiptResponse?.receipt;
    const id_receipt = createdReceipt?.id_receipt;

    // Solo si existe el id_receipt, crea la GiftCard
    if (id_receipt) {
      await axios.post(`${BASE_URL}/giftcard/createGift`, {
        buyer_email: buyerEmail,
        saldo: Number(amount),
        id_receipt: id_receipt,
      });
    } else {
      throw new Error("No se pudo obtener el id del recibo para crear la GiftCard.");
    }

    Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: "Recibo de GiftCard generado correctamente",
      showConfirmButton: true,
      confirmButtonText: "Descargar PDF",
      showCancelButton: true,
      cancelButtonText: "Cerrar",
    }).then((result) => {
      if (result.isConfirmed) {
        generatePDF();
      }
      resetForm();
      dispatch(resetReceiptState());
      navigate("/panel/caja");
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al crear recibo o GiftCard",
      text: `${error.response?.data?.message || error.message || "Inténtalo de nuevo."}`,
    });
  }
};

  const generatePDF = () => {
    // ... (lógica de generatePDF sin cambios)
     const doc = new jsPDF({ unit: "pt", format: [226.77, 400] });
    const currentReceiptNumber = typeof receiptNumber === "number" ? receiptNumber + 1 : 1001; // Usa el número actual + 1

    doc.setFontSize(18);
    doc.text("Bonita Boutique", doc.internal.pageSize.width / 2, 30, { align: "center" });
    doc.setFontSize(10);
    let currentY = 50;
    doc.text("Bonita Boutique  S.A.S NIT:", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 15;
    doc.text("901832769-3", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 15;
    doc.text("Cel: 3118318191", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 25;
    doc.text(`RECIBO GIFTCARD N°: ${currentReceiptNumber}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 15;
    doc.text(`Fecha: ${date}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 15;
    doc.text("***************************", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;
    doc.setFontSize(10);
    doc.text(`Cliente: ${buyerName}`, 20, currentY);
    currentY += 15;
    doc.text(`Email: ${buyerEmail}`, 20, currentY);
    currentY += 15;
    doc.text(`Teléfono: ${buyerPhone || "N/A"}`, 20, currentY);
    currentY += 20;
    doc.setFontSize(12);
    doc.text(`Monto GiftCard: $${Number(amount).toLocaleString()}`, 20, currentY);
    currentY += 15;
    doc.setFontSize(10);
    doc.text(`Método de Pago: ${actualPaymentMethod}`, 20, currentY);
    currentY += 20;
    doc.text("***************************", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;
    doc.text(
      `Atendido por: ${
        cashierInfo
          ? `${cashierInfo.first_name} ${cashierInfo.last_name}`
          : "N/A"
      }`,
      20,
      currentY
    );
    currentY += 30;
    doc.setFontSize(12);
    doc.text("Gracias por elegirnos!", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    doc.output("dataurlnewwindow");
  };

  // Manejo de estados de carga y error usando los estados de Redux
  if (clientLoading || cashierLoading) { // Usa los loading del store
    return <p>Cargando datos...</p>;
  }

  // Muestra error si hubo problema al cargar cliente o cajero
  if (clientError || cashierError) {
     const errorMsg = clientError?.message || clientError || cashierError?.message || cashierError || "Error desconocido";
    return <p>Error: {typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}</p>;
  }

  // Calcula newReceiptNumber aquí, después de los checks de loading/error
  const newReceiptNumber = typeof receiptNumber === "number" ? receiptNumber + 1 : 1001;

  // Formulario simplificado para GiftCard (sin cambios en la estructura JSX)
  return (
    // ... (JSX del formulario sin cambios)
     <div>
       <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)} // Botón para volver a la página anterior
          className="bg-gray-500 text-white px-4 py-2 rounded mt-8 ml-40 hover:bg-gray-600"
        >
          ← Volver
        </button>
      </div>
      <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-md mt-16">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Generar Recibo GiftCard
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Número de Recibo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Número de Recibo (Automático)
            </label>
            <input
              type="number"
              value={newReceiptNumber} // Usa la variable calculada
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
            />
          </div>

          {/* Cajero */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Cajero
            </label>
             <input
                type="text"
                value={
                  cashierInfo
                    ? `${cashierInfo.first_name} ${cashierInfo.last_name}`
                    : "N/A"
                }
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
              />
          </div>

          {/* Datos del Comprador (leídos del estado local actualizado por useEffect) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Comprador
            </label>
            <input type="text" value={buyerName} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"/>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input type="email" value={buyerEmail} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"/>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="tel" value={buyerPhone} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"/>
          </div>

          {/* Monto GiftCard */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Monto GiftCard</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Ingrese el monto"/>
          </div>

          {/* Fecha */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>

          {/* Método de Pago */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Pagado con
            </label>
            <select
              value={actualPaymentMethod}
              onChange={(e) => setActualPaymentMethod(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              {/* Opciones relevantes, EXCLUYENDO GiftCard */}
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta de Débito o Crédito</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="Otro">Otro</option>
              
            </select>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400" disabled={isSubmitted || clientLoading || cashierLoading}>
              Generar Recibo GiftCard
            </button>
            {isSubmitted && (
              <>
                <button type="button" onClick={generatePDF} className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Imprimir Recibo</button>
                <button type="button" onClick={handleExit} className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Salir</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default GiftCard;