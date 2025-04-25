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
  const [showSecondPayment, setShowSecondPayment] = useState(false);
  const [paymentMethod2, setPaymentMethod2] = useState("");
  const [amount1, setAmount1] = useState(""); // Primer monto
  const [amount2, setAmount2] = useState(""); // Segundo monto
  const [loadingCashier, setLoadingCashier] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, loading, error } = useSelector((state) => state.orderById);
  const { receiptNumber } = useSelector((state) => state);
  const { userInfo, loading: userLoading, error: userError } = useSelector((state) => state.userLogin);
  const { userInfo: cashierInfo, loading: cashierLoading, error: cashierError } = useSelector((state) => state.userTaxxa);
  
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [date, setDate] = useState("");
  const [cashGiven, setCashGiven] = useState("");
  const [change, setChange] = useState(0);

  const resetForm = () => {
    setPaymentMethod("Efectivo");
    setShowSecondPayment(false);
    setPaymentMethod2("");
    setAmount1("");
    setAmount2("");
    setBuyerName("");
    setBuyerEmail("");
    setBuyerPhone("");
    setTotalAmount("");
    setDate("");
    setCashGiven("");
    setChange(0);
    setIsSubmitted(false);
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
      setTotalAmount(order.amount);
      setDate(order.date);
      setBuyerName(`${order.userData.first_name} ${order.userData.last_name}`);
      setBuyerEmail(order.userData.email);
      setBuyerPhone(order.userData.phone);
      // Resetear montos y segundo pago al cargar nueva orden
      setAmount1("");
      setAmount2("");
      setShowSecondPayment(false);
      setPaymentMethod2("");
    }
  }, [order, idOrder, dispatch]);

  useEffect(() => {
    if (userInfo && userInfo.n_document) {
      setLoadingCashier(true);
      dispatch(fetchUserByDocument(userInfo.n_document)).finally(() => {
        setLoadingCashier(false);
      });
    }
  }, [userInfo, dispatch]);

  // Maneja el cambio del método de pago principal
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    // Opcional: Resetear segundo pago si cambia el primero
    setShowSecondPayment(false);
    setPaymentMethod2("");
    setAmount1("");
    setAmount2("");
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

    let finalAmount1;
    let finalAmount2 = null;
    let finalPayMethod2 = null;

    // **VALIDACIÓN Y ASIGNACIÓN DE MONTOS DENTRO DEL HANDLESUBMIT**
    if (showSecondPayment) {
      finalAmount1 = Number(amount1);
      finalAmount2 = Number(amount2);
      finalPayMethod2 = paymentMethod2;

      // Validar que los montos sean números y la suma sea correcta
      if (isNaN(finalAmount1) || isNaN(finalAmount2) || finalAmount1 <= 0 || finalAmount2 <= 0 || !finalPayMethod2) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Debes ingresar ambos montos y seleccionar el segundo método de pago.',
        });
        return;
      }

      if (finalAmount1 + finalAmount2 !== Number(totalAmount)) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La suma de los montos debe ser igual al total.',
        });
        return;
      }
    } else {
      // Si solo hay un método de pago
      finalAmount1 = Number(totalAmount);
    }

    if (isNaN(finalAmount1) || finalAmount1 <= 0) {
       Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El monto total no es válido.',
      });
      return;
    }


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
      amount: finalAmount1, // Usar el monto final calculado
      cashier_document: userInfo.n_document,
      cashier_name: `${cashierInfo.first_name} ${cashierInfo.last_name}`,
      payMethod2: finalPayMethod2, // Usar el método final
      amount2: finalAmount2,     // Usar el monto final
    };

    try {
      await dispatch(createReceipt(receiptData));
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
          generatePDF(finalAmount1, finalAmount2); // Pasar montos al PDF
        }
        resetForm();
        navigate(`/receipt/${order.id_orderDetail}`);
      });

    } catch (error) {
      console.error("Error creating receipt:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo crear el recibo: ${error.response?.data?.message || error.message || 'Inténtalo de nuevo.'}`
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
    doc.text(` ${buyerName}`, 20, currentY);
    currentY += 20;

    doc.text(` ${buyerEmail}`, 20, currentY);
    currentY += 20;

    doc.text(`Teléfono: ${buyerPhone || "N/A"}`, 20, currentY);
    currentY += 20;

    doc.text(`Monto Total: $${totalAmount}`, 20, currentY);
    currentY += 20;
    doc.text(`Metodo de Pago : ${paymentMethod} $${showSecondPayment ? monto1 : totalAmount}`, 20, currentY);
    currentY += 20;

    if (showSecondPayment && paymentMethod2 && amount2) {
      doc.text(`Metodo de Pago 2: ${paymentMethod2} $${amount2}`, 20, currentY);
      currentY += 20;
    }

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

    doc.output('dataurlnewwindow');
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Cajero</label>
            {loadingCashier ? (
              <input
                type="text"
                value="Cargando..."
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
              />
            ) : (
              <input
                type="text"
                value={cashierInfo ? `${cashierInfo.first_name} ${cashierInfo.last_name}` : 'N/A'}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Monto Total</label>
            <input
              type="number"
              value={totalAmount}
              readOnly // Hacerlo readOnly para evitar cambios manuales
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
            />
          </div>

          {/* Primer método de pago */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Método de Pago 1</label>
            <select
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
             {/* **INPUT PARA AMOUNT 1 (SOLO SI HAY 2 PAGOS)** */}
            {showSecondPayment && (
               <input
                type="number"
                value={amount1}
                onChange={e => setAmount1(e.target.value)}
                placeholder="Monto Método 1"
                required
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            )}
          </div>


          {/* Botón para agregar segundo método */}
          {!showSecondPayment && (
            <button
              type="button"
              className="mt-2 text-blue-600 underline text-xs"
              onClick={() => {
                setShowSecondPayment(true);
                // Opcional: Limpiar montos al mostrar segundo pago
                setAmount1("");
                setAmount2("");
              }}
            >
              + Agregar otro método de pago
            </button>
          )}

          {/* Sección del segundo método de pago */}
          {showSecondPayment && (
            <div className="mb-4 p-4 border border-gray-200 rounded">
             <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-medium text-gray-700">Método de Pago 2</label>
                <button
                  type="button"
                  className="text-red-500 text-xs"
                  onClick={() => {
                    setShowSecondPayment(false);
                    setPaymentMethod2("");
                    setAmount1(""); // Limpiar montos al quitar
                    setAmount2("");
                  }}
                >
                  Quitar
                </button>
              </div>
              <select
                value={paymentMethod2}
                onChange={e => setPaymentMethod2(e.target.value)}
                required // Hacerlo requerido si se muestra
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Seleccione</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta de Débito o Crédito</option>
                <option value="Crédito">Reserva Crédito</option>
                <option value="Addi">Addi</option>
                <option value="Sistecredito">Sistecredito</option>
                <option value="Bancolombia">Bancolombia</option>
                <option value="Otro">Otro</option>
              </select>
              <input
                type="number"
                value={amount2}
                onChange={e => setAmount2(e.target.value)}
                placeholder="Monto Método 2"
                required // Hacerlo requerido si se muestra
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          )}

          {/* ... Campos Efectivo (Dinero Entregado, Vuelto) y Fecha ... */}
           {/* Efectivo: Dinero entregado y vuelto (Solo si el PRIMER método es Efectivo y NO hay segundo pago) */}
          {paymentMethod === "Efectivo" && !showSecondPayment && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Dinero Entregado</label>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setCashGiven(value);
                    setChange(value - Number(totalAmount)); // Usar Number() por si acaso
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Vuelto</label>
                <input
                  type="text"
                  value={change >= 0 ? `$${change.toFixed(2)}` : "Monto insuficiente"}
                  readOnly
                  className={`mt-1 block w-full px-3 py-2 border ${
                    change >= 0 ? "border-gray-300" : "border-red-500"
                  } rounded-md shadow-sm bg-gray-100`}
                />
              </div>
            </>
          )}

          {/* ... Campo Fecha ... */}
           <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>


          {/* ... Botones Generar/Descargar Recibo ... */}
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
                onClick={() => generatePDF(
                  showSecondPayment ? Number(amount1) : Number(totalAmount),
                  showSecondPayment ? Number(amount2) : null
                )} // Pasar montos al PDF al hacer clic
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Descargar Recibo
              </button>
            )}
          </div>
        </form>

        {/* ... ReservationPopup ... */}
         {showReservationPopup && (
          <ReservationPopup
            orderId={order.id_orderDetail}
            totalAmount={totalAmount}
            onClose={() => setShowReservationPopup(false)}
            onSubmit={() => setShowReservationPopup(false)} // ¿Debería hacer algo más al enviar?
          />
        )}
      </div>
    </div>
  );
};

export default Recibo;