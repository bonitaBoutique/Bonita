import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import { fetchOrdersByIdOrder, fetchLatestReceipt, createReceipt, fetchLatestOrder, fetchUserByDocument, createReservation } from "../Redux/Actions/actions";
import ReservationPopup from "./ReservationPopup";

const Recibo = () => {
  const { idOrder } = useParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReservationPopup, setShowReservationPopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, loading, error } = useSelector((state) => state.orderById);
  const { receiptNumber, latestOrder } = useSelector((state) => state);
  const { userInfo, loading: userLoading, error: userError } = useSelector((state) => state.userTaxxa);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [date, setDate] = useState("");
  const [receiptCreated, setReceiptCreated] = useState(false);
  const [payMethod, setPayMethod] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const initialFormState = {
    payMethod: "Efectivo",
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    totalAmount: "",
    date: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setPayMethod("Efectivo");
  };

  useEffect(() => {
    if (!order || order.id_orderDetail !== idOrder) {
      dispatch(fetchOrdersByIdOrder(idOrder));
    }

    if (!receiptNumber) {
      dispatch(fetchLatestReceipt());
    }

    dispatch(fetchLatestOrder());
  }, [dispatch, idOrder, order, receiptNumber]);

  useEffect(() => {
    if (order && order.id_orderDetail === idOrder) {
      console.log(order)
      setTotalAmount(order.amount);
      setDate(order.date);
      setBuyerName(`${order.userData.first_name} ${order.userData.last_name}`);
      setBuyerEmail(order.userData.email);
      setBuyerPhone(order.userData.phone);
      // Despacha la acción para obtener la información del usuario
      dispatch(fetchUserByDocument(order.n_document));
    }
  }, [order, idOrder, dispatch]);

  useEffect(() => {
    if (userInfo && userInfo.data) {
      const userData = userInfo.data;
      console.log("User info received:", userData);
      setBuyerName(`${order.first_name} ${order.last_name}`);
      setBuyerEmail(order.email);
      setBuyerPhone(order.phone);
    }
  }, [userInfo]);

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    if (method === "Crédito") {
      setShowReservationPopup(true);
    } else {
      setShowReservationPopup(false);
    }
  };

  const handleReservationClose = () => {
    setShowReservationPopup(false);
  };

  const handleReservationSubmit = (reservationData) => {
    const id_orderDetail = order.id_orderDetail; // Extract the id_orderDetail string
    const n_document = order.n_document; // Extract the n_document from the order
    console.log('Submitting reservation with order ID:', id_orderDetail); // Log the order ID
    dispatch(createReservation(id_orderDetail, { ...reservationData, n_document }));
    setShowReservationPopup(false);
  };

  if (loading || userLoading) {
    return <p>Cargando detalles de la orden...</p>;
  }

  if (error || userError) {
    return <p>Error al cargar la orden: {error || userError}</p>;
  }

  if (!order || order.id_orderDetail !== idOrder) {
    return <p>No se encontró la orden</p>;
  }

  const newReceiptNumber = receiptNumber ? receiptNumber + 1 : 1001;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo || !order) {
      Swal.fire('Error', 'Faltan datos necesarios', 'error');
      return;
    }

    const receiptData = {
      receiptNumber: newReceiptNumber,  // Número de recibo calculado
      total_amount: parseFloat(totalAmount), // Monto total (asegurarse de que es un número)
      date: date,  // Fecha de la orden
      id_orderDetail: order.id_orderDetail,  // ID de la orden
      buyer_name: buyerName,  // Nombre del comprador
      buyer_email: buyerEmail,  // Correo electrónico del comprador
      buyer_phone: buyerPhone,  // Teléfono del comprador
      payMethod: paymentMethod
    };

    console.log("Enviando datos al backend:", receiptData);
    try {
      await dispatch(createReceipt(receiptData));
      setReceiptCreated(true);
      setIsSubmitted(true);
      resetForm(); // Reset all form data
      navigate(`/receipt/${order.id_orderDetail}`);
      Swal.fire('Éxito', 'Recibo generado correctamente', 'success');
    } catch (error) {
      console.error("Error creating receipt:", error);
      Swal.fire('Error', 'No se pudo crear el recibo. Inténtalo de nuevo.', 'error');
    }
  };

  const generatePDF = () => {
    // Crear un nuevo documento PDF con tamaño 80x297 mm
    const doc = new jsPDF({
      unit: "pt",  // Establecer la unidad a puntos
      format: [226.77, 839.28],  // Definir el tamaño del recibo en puntos (80 x 297 mm)
    });

    // Título centrado en la parte superior
    doc.setFontSize(18);
    doc.text("Bonita Boutique", doc.internal.pageSize.width / 2, 30, { align: "center" });

    // Información adicional centrada y más pequeña
    doc.setFontSize(10);
    let currentY = 50; // Posición inicial

    doc.text("Bonita Boutique  S.A.S NIT:", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;  // Espacio mayor entre líneas

    doc.text("901832769-3", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;

    doc.text("Cel: 3118318191", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 30; // Más espacio antes de la sección siguiente

    // Número de recibo centrado
    doc.text(`RECIBO # ${newReceiptNumber}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;

    // Fecha y estado de la venta
    doc.text(`Fecha: ${date}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;

    doc.text(`Estado de venta: ${order.state_order}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });

    // Línea de asteriscos
    currentY += 20; // Espacio antes de la línea
    doc.text("***************************", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20; // Espacio después de la línea

    // Detalles del recibo
    doc.setFontSize(10);  // Tamaño de fuente más pequeño para los detalles
    doc.text(`Nombre del Comprador: ${buyerName}`, 20, currentY);
    currentY += 20;

    doc.text(`Correo Electrónico: ${buyerEmail}`, 20, currentY);
    currentY += 20;

    doc.text(`Teléfono: ${buyerPhone || "N/A"}`, 20, currentY);
    currentY += 20;

    doc.text(`Monto Total: $${totalAmount}`, 20, currentY);
    currentY += 20;
    doc.text(`Metodo de Pago : ${paymentMethod}`, 20, currentY);
    currentY += 20;
    doc.setFontSize(8);
    doc.text(`Orden: ${order.id_orderDetail}`, 20, currentY);

    // Agregar texto final centrado
    currentY += 40; // Espacio mayor antes del mensaje final
    doc.setFontSize(12);
    doc.text("Gracias por elegirnos!", doc.internal.pageSize.width / 2, currentY, { align: "center" });

    // Guardar el PDF con un nombre personalizado que incluye el número de recibo
    const fileName = `Recibo_${newReceiptNumber}.pdf`;  // Nombre del archivo
    doc.save(fileName);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/panel")}
          className="bg-gray-500 text-white px-4 py-2 rounded mt-8 ml-40 hover:bg-gray-600"
        >
          ← Volver
        </button>
      </div>
      
      <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-md mt-16">
        <h2 className="text-2xl font-semibold text-center mb-4">Formulario de Recibo</h2>

        {/* Mostrar la alerta solo si se ha creado el recibo correctamente */}
        {receiptCreated && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 border border-green-400 rounded-md">
            ¡Recibo creado correctamente!
          </div>
        )}

        {/* Mostrar mensaje de error si hay un error */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded-md">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Número de Recibo</label>
            <input
              type="number"
              value={newReceiptNumber}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nombre del Comprador</label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Monto Total</label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
            <select
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>Seleccione un método</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta de Débito o Crédito</option>
              <option value="Crédito">Reserva Crédito</option>
              <option value="Addi">Addi</option>
              <option value="Sistecredito">Sistecredito</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              disabled={isSubmitted}
            >
              Generar Recibo
            </button>

            {isSubmitted && (
              <button 
                type="button"
                onClick={generatePDF}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Descargar Recibo
              </button>
            )}
          </div>
        </form>
        {showReservationPopup && (
          <ReservationPopup
            orderId={order.id_orderDetail} // Pass the correct id_orderDetail
            totalAmount={totalAmount}
            onClose={handleReservationClose}
            onSubmit={handleReservationSubmit}
          />
        )}
      </div>

      {receiptCreated && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          Recibo generado exitosamente
        </div>
      )}
    </div>
  );
};

export default Recibo;