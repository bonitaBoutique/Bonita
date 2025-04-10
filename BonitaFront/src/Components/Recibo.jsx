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
  const { userInfo, loading: userLoading, error: userError } = useSelector((state) => state.userLogin);
  const { userInfo: cashierInfo, loading: cashierLoading, error: cashierError } = useSelector((state) => state.userTaxxa); // Obtén el estado del cajero
  const [loadingCashier, setLoadingCashier] = useState(true);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [date, setDate] = useState("");
  const [cashGiven, setCashGiven] = useState(""); // Dinero entregado por el cliente
const [change, setChange] = useState(0); // Vuelto calculado
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
    setPayMethod("Efectivo"); // Restablecer el método de pago a su valor predeterminado
    setBuyerName("");
    setBuyerEmail("");
    setBuyerPhone("");
    setTotalAmount("");
    setDate("");
    setCashGiven(""); // Reiniciar el dinero entregado
    setChange(0); // Reiniciar el vuelto
    setIsSubmitted(false); // Permitir que se genere un nuevo recibo
    setReceiptCreated(false); // Reiniciar el estado del recibo creado
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
    }
  }, [order, idOrder, dispatch]);

  useEffect(() => {
    if (userInfo && userInfo.n_document) {
      setLoadingCashier(true);
      dispatch(fetchUserByDocument(userInfo.n_document))
        .finally(() => {
          setLoadingCashier(false);
        });
    }
  }, [userInfo, dispatch]);

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
    const id_orderDetail = order.id_orderDetail;
    const n_document = order.n_document;
    console.log('Submitting reservation with order ID:', id_orderDetail);
    dispatch(createReservation(id_orderDetail, { ...reservationData, n_document }));
    setShowReservationPopup(false);
  };

  if (loading || userLoading || cashierLoading) {
    return <p>Cargando detalles de la orden...</p>;
  }

  if (error || userError || cashierError) {
    return <p>Error al cargar la orden: {error || userError || cashierError}</p>;
  }

  if (!order || order.id_orderDetail !== idOrder) {
    return <p>No se encontró la orden</p>;
  }

  const newReceiptNumber = receiptNumber ? receiptNumber + 1 : 1001;

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!userInfo || !order || !cashierInfo) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Faltan datos necesarios'
      });
      return;
    }
  
    const receiptData = {
      receiptNumber: newReceiptNumber,
      total_amount: parseFloat(totalAmount),
      date: date,
      id_orderDetail: order.id_orderDetail,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone,
      payMethod: paymentMethod,
      cashier_document: userInfo.n_document,
      cashier_name: `${cashierInfo.first_name} ${cashierInfo.last_name}`,
    };
  
    try {
      await dispatch(createReceipt(receiptData));
      setReceiptCreated(true);
      setIsSubmitted(true);
  
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Recibo generado correctamente',
        showConfirmButton: true,
        confirmButtonText: 'Descargar PDF',
        showCancelButton: true,
        cancelButtonText: 'Cerrar'
      }).then((result) => {
        if (result.isConfirmed) {
          generatePDF();
        }
        resetForm(); // Reiniciar el formulario después de generar el PDF
        navigate(`/receipt/${order.id_orderDetail}`);
      });
  
    } catch (error) {
      console.error("Error creating receipt:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el recibo. Inténtalo de nuevo.'
      });
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      unit: "pt",
      format: [226.77, 839.28],
    });
  
    doc.setFontSize(18);
    doc.text("Bonita Boutique", doc.internal.pageSize.width / 2, 30, { align: "center" });
  
    doc.setFontSize(10);
    let currentY = 50;
  
    doc.text("Bonita Boutique  S.A.S NIT:", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;
  
    doc.text("901832769-3", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;
  
    doc.text("Cel: 3118318191", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 30;
  
    doc.text(`RECIBO # ${newReceiptNumber}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;
  
    doc.text(`Fecha: ${date}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;
  
    doc.text(`Estado de venta: ${order.state_order}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });
  
    currentY += 20;
    doc.text("***************************", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;
  
    doc.setFontSize(10);
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
  
    doc.text("***************************", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;
  
    // Agregar productos al recibo
    doc.setFontSize(7);
    currentY += 20;
  
    order.products.forEach((product, index) => {
      doc.text(
        `${index + 1}. ${product.description} - $${product.priceSell}`,
        20,
        currentY
      );
      currentY += 15;
    });
  
    currentY += 20;
    doc.text("***************************", doc.internal.pageSize.width / 2, currentY, { align: "center" });
    currentY += 20;
  
    doc.setFontSize(10);
    doc.text(`Atendido por: ${cashierInfo ? `${cashierInfo.first_name} ${cashierInfo.last_name}` : 'N/A'}`, 20, currentY);
    currentY += 15;
  
    doc.setFontSize(8);
    doc.text(`Orden: ${order.id_orderDetail}`, 20, currentY);
    currentY += 30;
  
    doc.setFontSize(12);
    doc.text("Gracias por elegirnos!", doc.internal.pageSize.width / 2, currentY, { align: "center" });
  
    const fileName = `Recibo_${newReceiptNumber}.pdf`;
    doc.save(fileName);
  
    // Reiniciar los datos del formulario después de guardar el PDF
    resetForm();
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
            <label className="block text-sm font-medium text-gray-700">Cajero</label>
            {loadingCashier ? (
              <input
                type="text"
                value="Cargando..."
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            ) : (
              <input
                type="text"
                value={cashierInfo ? `${cashierInfo.first_name} ${cashierInfo.last_name}` : 'N/A'}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            )}
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
          {paymentMethod === "Efectivo" && (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">Dinero Entregado</label>
    <input
      type="number"
      value={cashGiven}
      onChange={(e) => {
        const value = parseFloat(e.target.value) || 0;
        setCashGiven(value);
        setChange(value - totalAmount); // Calcular el vuelto automáticamente
      }}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
)}
{paymentMethod === "Efectivo" && (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">Vuelto</label>
    <input
      type="text"
      value={change >= 0 ? `$${change.toFixed(2)}` : "Monto insuficiente"}
      readOnly
      className={`mt-1 block w-full px-3 py-2 border ${
        change >= 0 ? "border-gray-300" : "border-red-500"
      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
    />
  </div>
)}
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
              disabled={isSubmitted || loadingCashier}
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
            orderId={order.id_orderDetail}
            totalAmount={totalAmount}
            onClose={handleReservationClose}
            onSubmit={handleReservationSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Recibo;