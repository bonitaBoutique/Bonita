import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
// ✅ Importar utilidades de fecha para Colombia
import { getColombiaDate, formatDateForDisplay, isValidDate } from "../utils/dateUtils";
import {
  fetchLatestReceipt,
  createReceipt,
  fetchUserByDocument,
  resetReceiptState,
} from "../Redux/Actions/actions";
import axios from "axios";
import { BASE_URL } from "../Config";

const GiftCard = () => {
  const { n_document } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Obtener datos de la navegación desde devolución
  const returnData = location.state?.returnData;
  const giftCardCreated = location.state?.giftCardCreated || false;
  const mode = location.state?.mode || 'create'; // 'create' o 'view'

  console.log("🎁 GiftCard - Datos recibidos:", { returnData, giftCardCreated, mode });

  // Estados locales del formulario
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ NUEVO: Prevenir doble submit
  const [amount, setAmount] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  // ✅ Estado de fecha inicializado con fecha de Colombia
  const [date, setDate] = useState(() => getColombiaDate());
  const [actualPaymentMethod, setActualPaymentMethod] = useState("Efectivo");
  const [isFromReturn, setIsFromReturn] = useState(false);

  // Selectors de Redux
  const { receiptNumber } = useSelector((state) => state);
  const {
    userInfo: cashierInfo,
    loading: cashierLoading,
    error: cashierError,
  } = useSelector((state) => state.userTaxxa || {});

  const {
    userInfo: clientData,
    loading: clientLoading,
    error: clientError,
  } = useSelector((state) => state.userTaxxa || { userInfo: null, loading: false, error: null });

  // ✅ Efecto para manejar datos de devolución
  useEffect(() => {
    if (returnData) {
      console.log("🎁 Configurando GiftCard con datos de devolución:", returnData);
      setIsFromReturn(true);
      
      // Precargar datos del cliente
      if (returnData.clientName) setBuyerName(returnData.clientName);
      if (returnData.clientEmail) setBuyerEmail(returnData.clientEmail);
      if (returnData.clientPhone) setBuyerPhone(returnData.clientPhone);
      if (returnData.totalAmount) setAmount(returnData.totalAmount.toString());
      
      // Si la GiftCard ya fue creada, mostrar mensaje informativo
      if (giftCardCreated && mode === 'view') {
        console.log("🎁 GiftCard ya creada, mostrando modo visualización");
        setIsSubmitted(true);
        
        Swal.fire({
          title: "🎁 GiftCard Creada Automáticamente",
          html: `
            <div class="text-left">
              <p><strong>Cliente:</strong> ${returnData.clientName}</p>
              <p><strong>Email:</strong> ${returnData.clientEmail}</p>
              <p><strong>Monto:</strong> $${returnData.totalAmount.toLocaleString("es-CO")}</p>
              <p><strong>GiftCard ID:</strong> #${returnData.giftCardId || 'N/A'}</p>
              <p><strong>Motivo:</strong> ${returnData.reason}</p>
              <br>
              <p>✅ La GiftCard fue creada automáticamente durante la devolución.</p>
              <p>📄 Puedes generar el PDF desde el botón correspondiente.</p>
            </div>
          `,
          icon: "success",
          confirmButtonText: "🖨️ Generar PDF",
          showCancelButton: true,
          cancelButtonText: "Cerrar"
        }).then((result) => {
          if (result.isConfirmed) {
            generatePDF();
          }
        });
      }
    }
  }, [returnData, giftCardCreated, mode]);

  // Efecto para cargar cliente y establecer fecha de Colombia
  useEffect(() => {
    if (n_document) {
      dispatch(fetchUserByDocument(n_document));
      // ✅ Establecer fecha actual de Colombia
      setDate(getColombiaDate());
    } else {
      console.error("No se proporcionó documento del cliente.");
    }
  }, [n_document, dispatch]);

  // Efecto para actualizar datos del cliente
  useEffect(() => {
    if (clientData) {
      setBuyerName(`${clientData.first_name || ""} ${clientData.last_name || ""}`);
      setBuyerEmail(clientData.email || "");
      setBuyerPhone(clientData.phone || "");
    } else {
      setBuyerName("");
      setBuyerEmail("");
      setBuyerPhone("");
    }
  }, [clientData]);

  // Cargar último número de recibo
  useEffect(() => {
    if (receiptNumber === undefined || receiptNumber === null) {
      dispatch(fetchLatestReceipt());
    }
  }, [dispatch, receiptNumber]);

  // ✅ Función de reset mejorada con fecha de Colombia
  const resetForm = () => {
    setAmount("");
    setDate(getColombiaDate()); // ✅ Usar fecha de Colombia
    setIsSubmitted(false);
  };

  const handleExit = () => {
    dispatch(resetReceiptState());
    navigate("/panel/caja");
  };

  // ✅ Validar fecha cuando cambia
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (!isValidDate(selectedDate)) {
      Swal.fire("Error", "Por favor selecciona una fecha válida", "error");
      return;
    }

    // Validar que no sea una fecha futura
    const today = new Date(getColombiaDate());
    const selected = new Date(selectedDate);

    if (selected > today) {
      Swal.fire({
        icon: "warning",
        title: "Fecha inválida",
        text: "No se pueden generar GiftCards con fecha futura.",
      });
      return;
    }

    setDate(selectedDate);
    console.log("Fecha seleccionada (Colombia):", selectedDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Prevenir doble submit
    if (isSubmitting) {
      console.log("⚠️ Ya se está procesando una GiftCard");
      return;
    }

    // Validar que los datos del cliente se hayan cargado
    if (!buyerName || !buyerEmail) {
      Swal.fire("Error", "No se pudieron cargar los datos del cliente.", "error");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      Swal.fire("Error", "Ingresa un monto válido mayor a 0.", "error");
      return;
    }

    // ✅ Validar fecha
    if (!isValidDate(date)) {
      Swal.fire("Error", "Selecciona una fecha válida.", "error");
      return;
    }

    if (!cashierInfo?.n_document) {
      Swal.fire("Error", "No se pudo identificar al cajero.", "error");
      return;
    }

    if (!actualPaymentMethod) {
      Swal.fire("Error", "Selecciona cómo se pagó la GiftCard.", "error");
      return;
    }

    // ✅ Datos con fecha correcta de Colombia
    const receiptData = {
      total_amount: parseFloat(amount),
      date: date, // ✅ Ya está en formato YYYY-MM-DD de Colombia
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone,
      payMethod: "GiftCard",
      amount: Number(amount),
      cashier_document: cashierInfo?.n_document,
      actualPaymentMethod: actualPaymentMethod,
    };

    console.log("Enviando GiftCard con fecha de Colombia:", receiptData);

    try {
      // ✅ Activar estado de carga
      setIsSubmitting(true);

      // Mostrar loading
      Swal.fire({
        title: "Creando GiftCard...",
        text: "Por favor espera mientras procesamos la tarjeta regalo",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const receiptResponse = await dispatch(createReceipt(receiptData));
      setIsSubmitted(true);

      const createdReceipt = receiptResponse?.payload?.receipt || receiptResponse?.receipt;
      const id_receipt = createdReceipt?.id_receipt;

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
        text: `GiftCard generada para el ${formatDateForDisplay(date)}`,
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
      console.error("Error al crear GiftCard:", error);
      Swal.fire({
        icon: "error",
        title: "Error al crear GiftCard",
        text: `${error.response?.data?.message || error.message || "Inténtalo de nuevo."}`,
      });
    } finally {
      // ✅ Desactivar estado de carga siempre (éxito o error)
      setIsSubmitting(false);
    }
  };

  // ✅ Función generatePDF mejorada con formato de fecha
  const generatePDF = () => {
    const doc = new jsPDF({ unit: "pt", format: [226.77, 400] });
    const currentReceiptNumber = typeof receiptNumber === "number" ? receiptNumber + 1 : 1001;

    doc.setFontSize(18);
    doc.text("Bonita Boutique", doc.internal.pageSize.width / 2, 30, { align: "center" });
    
    doc.setFontSize(10);
    let currentY = 50;
    
    doc.text("Bonita Boutique S.A.S NIT:", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 15;
    
    doc.text("901832769-3", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 15;
    
    doc.text("Cel: 3118318191", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 25;
    
    doc.text(`RECIBO GIFTCARD N°: ${currentReceiptNumber}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 15;
    
    // ✅ Fecha formateada correctamente para Colombia
    doc.text(`Fecha: ${formatDateForDisplay(date)}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });
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
    doc.text(`Monto GiftCard: $${Number(amount).toLocaleString("es-CO")}`, 20, currentY);
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
    doc.text("¡Gracias por elegirnos!", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    
    doc.output("dataurlnewwindow");
  };

  // Estados de carga y error
  if (clientLoading || cashierLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (clientError || cashierError) {
    const errorMsg = clientError?.message || clientError || cashierError?.message || cashierError || "Error desconocido";
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Error: {typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}</p>
          <button
            onClick={() => navigate("/panel/caja")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Volver a Caja
          </button>
        </div>
      </div>
    );
  }

  const newReceiptNumber = typeof receiptNumber === "number" ? receiptNumber + 1 : 1001;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded mt-8 ml-40 hover:bg-gray-600"
        >
          ← Volver
        </button>
      </div>

      <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-md mt-16">
        <h2 className="text-2xl font-semibold text-center mb-4">
          {isFromReturn && giftCardCreated 
            ? "🎁 GiftCard de Devolución" 
            : "Generar Recibo GiftCard"
          }
        </h2>

        {/* ✅ Indicador de GiftCard automática */}
        {isFromReturn && (
          <div className={`p-3 rounded-lg mb-4 ${
            giftCardCreated 
              ? "bg-green-50 border border-green-200" 
              : "bg-yellow-50 border border-yellow-200"
          }`}>
            <p className={`text-sm ${
              giftCardCreated 
                ? "text-green-800" 
                : "text-yellow-800"
            }`}>
              {giftCardCreated 
                ? "✅ Esta GiftCard fue creada automáticamente durante una devolución. Los datos están precargados."
                : "ℹ️ Esta GiftCard se está creando desde una devolución. Los datos del cliente están precargados."
              }
            </p>
            {returnData?.originalReceiptId && (
              <p className={`text-xs mt-1 ${
                giftCardCreated 
                  ? "text-green-600" 
                  : "text-yellow-600"
              }`}>
                Recibo original: #{returnData.originalReceiptId}
                {returnData?.giftCardId && ` | GiftCard ID: #${returnData.giftCardId}`}
              </p>
            )}
          </div>
        )}

        {/* Información de fecha actual */}
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            <strong>Fecha actual de Colombia:</strong> {formatDateForDisplay(getColombiaDate())}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Número de Recibo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Número de Recibo (Automático)
            </label>
            <input
              type="number"
              value={newReceiptNumber}
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

          {/* Datos del Comprador */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Comprador
            </label>
            <input
              type="text"
              value={buyerName}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={buyerEmail}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              value={buyerPhone}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
            />
          </div>

          {/* Monto GiftCard */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Monto GiftCard *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese el monto"
            />
          </div>

          {/* ✅ Fecha mejorada */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Fecha *
            </label>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              max={getColombiaDate()} // No permitir fechas futuras
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              Fecha seleccionada: {formatDateForDisplay(date)}
            </p>
          </div>

          {/* Método de Pago */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Pagado con *
            </label>
            <select
              value={actualPaymentMethod}
              onChange={(e) => setActualPaymentMethod(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta de Débito">Tarjeta de Débito</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Nequi">Nequi</option>
              <option value="Daviplata">Daviplata</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="Addi">Addi</option>
              <option value="Sistecredito">Sistecredito</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
              disabled={isSubmitted || isSubmitting || clientLoading || cashierLoading}
            >
              {isSubmitting ? "Procesando..." : "Generar Recibo GiftCard"}
            </button>
            
            {isSubmitted && (
              <>
                <button
                  type="button"
                  onClick={generatePDF}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                >
                  Imprimir Recibo
                </button>
                <button
                  type="button"
                  onClick={handleExit}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300"
                >
                  Salir
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default GiftCard;