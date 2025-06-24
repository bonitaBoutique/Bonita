import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import {
  fetchOrdersByIdOrder,
  fetchLatestReceipt,
  createReceipt,
  fetchLatestOrder,
  fetchUserByDocument,
  createReservation,
  resetReceiptState,
  clearOrderState,
  updateOrderState,
} from "../Redux/Actions/actions";
import ReservationPopup from "./ReservationPopup";
import {
  getColombiaDate,
  formatDateForDisplay,
  isValidDate,
} from "../utils/dateUtils";

const Recibo = () => {
  const { idOrder } = useParams();
  const { n_document } = useParams();

  // ✅ ESTADOS LOCALES
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [showSecondPayment, setShowSecondPayment] = useState(false);
  const [paymentMethod2, setPaymentMethod2] = useState("");
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");
  const [loadingCashier, setLoadingCashier] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [date, setDate] = useState(() => getColombiaDate());
  const [cashGiven, setCashGiven] = useState("");
  const [change, setChange] = useState(0);
  const [observations, setObservations] = useState("");
  const [reservationInfo, setReservationInfo] = useState(null);
  const [isReservation, setIsReservation] = useState(false);
  const [showReservationPopup, setShowReservationPopup] = useState(false);
  // ✅ HOOKS
  const dispatch = useDispatch();
  const navigate = useNavigate();



// ✅ SELECTORES REDUX
  const { order, loading, error } = useSelector((state) => state.orderById);
  const { receiptNumber } = useSelector((state) => state);
  const {
    receiptsLoading = false,
    receiptsError = null,
    receipts = [],
  } = useSelector((state) => state);

  const {
    userInfo,
    loading: userLoading,
    error: userError,
  } = useSelector((state) => state.userLogin);

  const {
    userInfo: cashierInfo,
    loading: cashierLoading,
    error: cashierError,
  } = useSelector((state) => state.userTaxxa);

  // ✅ CÁLCULOS DERIVADOS
  const discountAmount = (Number(totalAmount) * Number(discount)) / 100;
  const totalWithDiscount = Math.max(0, Number(totalAmount) - discountAmount);
  const newReceiptNumber = receiptNumber ? receiptNumber + 1 : 1001;

  // ✅ FUNCIONES UTILITARIAS
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
  setDate(getColombiaDate());
  setCashGiven("");
  setChange(0);
  setDiscount(0);
  setObservations("");
  setIsSubmitted(false);
  // ✅ LIMPIAR ESTADOS DE RESERVA
  setIsReservation(false);
  setReservationInfo(null);
  setShowReservationPopup(false);
};

  const handleExit = () => {
    dispatch(resetReceiptState());
    dispatch(clearOrderState());
    navigate("/panel/caja"); // ✅ Ruta consistente
  };

  // ✅ MANEJO DE MÉTODOS DE PAGO
 const handlePaymentMethodChange = async (e) => {
  const value = e.target.value;
  setPaymentMethod(value);
  setShowSecondPayment(false);
  setPaymentMethod2("");
  setAmount1("");
  setAmount2("");

  if (value === "Crédito") {
    try {
      console.log('🔵 Actualizando orden a Reserva a Crédito:', order.id_orderDetail);
      
      await dispatch(updateOrderState(
        order.id_orderDetail,
        "Reserva a Crédito",
        null,
        order.amount,
        0
      ));

      setShowReservationPopup(true);
      console.log('✅ Orden actualizada, abriendo popup de reserva');
    } catch (error) {
      console.error('❌ Error al actualizar orden:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la orden a Reserva a Crédito'
      });
      setPaymentMethod("Efectivo");
    }
  }
};

  // ✅ MANEJO DE EFECTIVO CON DESCUENTO
  const handleCashGivenChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setCashGiven(value);

    // ✅ CALCULAR VUELTO CON PRECISIÓN
    const totalAmount = Number(totalWithDiscount);
    const changeAmount = value - totalAmount;
    setChange(Math.round(changeAmount * 100) / 100); // Redondear a 2 decimales
  };

  // ✅ EFFECTS
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
    
    // ✅ MANEJAR DATOS DEL BUYER/CLIENTE (Usuario con rol "User")
    if (order.User) {
      // Si la orden tiene relación directa con User
      setBuyerName(`${order.User.first_name} ${order.User.last_name}`);
      setBuyerEmail(order.User.email);
      setBuyerPhone(order.User.phone || "");
    } else if (order.userData) {
      // Si los datos están en userData
      setBuyerName(`${order.userData.first_name} ${order.userData.last_name}`);
      setBuyerEmail(order.userData.email);
      setBuyerPhone(order.userData.phone || "");
    } else {
      // Si no hay datos del usuario, dejar vacío para llenar manualmente
      setBuyerName("");
      setBuyerEmail("");
      setBuyerPhone("");
    }
    
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

  // ✅ MANEJO DE SUBMIT
  // ✅ MANEJO DE SUBMIT CORREGIDO
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de descuento
    if (discount < 0 || discount > 100) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El descuento debe estar entre 0% y 100%.",
      });
      return;
    }

    let finalAmount1;
    let finalAmount2 = null;
    let finalPayMethod2 = null;

    // Validación y asignación de montos
    if (showSecondPayment) {
      finalAmount1 = Number(amount1);
      finalAmount2 = Number(amount2);
      finalPayMethod2 = paymentMethod2;

      if (
        isNaN(finalAmount1) ||
        isNaN(finalAmount2) ||
        finalAmount1 <= 0 ||
        finalAmount2 <= 0 ||
        !finalPayMethod2
      ) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debes ingresar ambos montos y seleccionar el segundo método de pago.",
        });
        return;
      }

      if (finalAmount1 + finalAmount2 !== totalWithDiscount) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `La suma de los montos debe ser igual al total con descuento: $${totalWithDiscount.toLocaleString(
            "es-CO"
          )}`,
        });
        return;
      }
    } else {
      finalAmount1 = totalWithDiscount;
    }

    // ✅ VALIDACIÓN CORREGIDA PARA EFECTIVO
    if (paymentMethod === "Efectivo" && !showSecondPayment) {
      const cashAmount = Number(cashGiven);
      const totalAmount = Number(totalWithDiscount);

      // Permitir diferencias mínimas por redondeo (0.01)
      if (!cashGiven || cashAmount < totalAmount - 0.01) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `El dinero entregado ($${cashAmount.toFixed(
            2
          )}) debe ser mayor o igual al total a pagar ($${totalAmount.toFixed(
            2
          )}).`,
        });
        return;
      }
    }

    if (isNaN(finalAmount1) || finalAmount1 <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El monto total no es válido.",
      });
      return;
    }

    if (!userInfo || !order || !cashierInfo) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Faltan datos necesarios para generar el recibo.",
      });
      return;
    }
    const receiptData = {
      receiptNumber: newReceiptNumber,
      total_amount: totalWithDiscount,
      date: date,
      id_orderDetail: order.id_orderDetail,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone,
      payMethod: paymentMethod,
      amount: finalAmount1,
      cashier_document: userInfo.n_document,
      cashier_name: `${cashierInfo.first_name} ${cashierInfo.last_name}`,
      payMethod2: finalPayMethod2,
      amount2: finalAmount2,
      discount: discount,
      observations: observations,
    };

    try {
      await dispatch(createReceipt(receiptData));

      await dispatch(
        updateOrderState(
          order.id_orderDetail,
          order.state_order,
          null,
          totalWithDiscount,
          discount
        )
      );

      setIsSubmitted(true);

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Recibo generado correctamente",
        showConfirmButton: true,
        confirmButtonText: "Descargar PDF",
        showCancelButton: true,
        cancelButtonText: "Cerrar",
      }).then((result) => {
        if (result.isConfirmed) {
          generatePDF(finalAmount1, finalAmount2);
        }

        resetForm();
        dispatch(resetReceiptState());
        dispatch(clearOrderState());
        navigate("/panel/caja");
      });
    } catch (error) {
      console.error("Error creating receipt:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudo crear el recibo: ${
          error.response?.data?.message ||
          error.message ||
          "Inténtalo de nuevo."
        }`,
      });
    }
  };

  // ✅ GENERACIÓN DE PDF CORREGIDA
const generatePDF = (amount1Param = null, amount2Param = null) => {
  const doc = new jsPDF({
    unit: "pt",
    format: [226.77, 839.28],
  });

  doc.setFontSize(18);
  doc.text("Bonita Boutique", doc.internal.pageSize.width / 2, 30, {
    align: "center",
  });

  doc.setFontSize(10);
  let currentY = 50;

  doc.text("Bonita Boutique S.A.S NIT:", doc.internal.pageSize.width / 2, currentY, {
    align: "center"
  });
  currentY += 20;

  doc.text("901832769-3", doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 20;

  doc.text("Cel: 3118318191", doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 30;

  doc.text(`RECIBO # ${newReceiptNumber}`, doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 20;

  doc.text(`Fecha: ${date}`, doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 20;

  // ✅ MOSTRAR TIPO DE TRANSACCIÓN
  doc.setFontSize(12);
  if (isReservation && reservationInfo) {
    doc.text("TIPO: RESERVA A CRÉDITO", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
  } else {
    doc.text(`Estado: ${order.state_order}`, doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
  }
  currentY += 20;

  doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 20;

  doc.setFontSize(10);
  doc.text(`Cliente: ${buyerName}`, 20, currentY);
  currentY += 20;

  doc.text(`Email: ${buyerEmail}`, 20, currentY);
  currentY += 20;

  doc.text(`Teléfono: ${buyerPhone || "N/A"}`, 20, currentY);
  currentY += 20;

  // ✅ MOSTRAR DOCUMENTO DEL CLIENTE
  if (isReservation && reservationInfo?.buyerDocument) {
    doc.text(`Documento: ${reservationInfo.buyerDocument}`, 20, currentY);
    currentY += 20;
  }

  doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 20;

  // ✅ INFORMACIÓN ESPECÍFICA DE RESERVA
  if (isReservation && reservationInfo) {
    doc.setFontSize(11);
    doc.text("DETALLES DE RESERVA:", 20, currentY);
    currentY += 20;
    
    doc.text(`Monto Total: $${Number(totalAmount).toLocaleString("es-CO")}`, 20, currentY);
    currentY += 15;
    
    doc.text(`Pago Inicial: $${reservationInfo.partialPayment.toLocaleString("es-CO")}`, 20, currentY);
    currentY += 15;
    
    doc.text(`Saldo Pendiente: $${reservationInfo.remainingAmount.toLocaleString("es-CO")}`, 20, currentY);
    currentY += 15;
    
    doc.text(`Método de Pago: ${reservationInfo.paymentMethod}`, 20, currentY);
    currentY += 15;
    
    doc.text(`Fecha de Vencimiento: ${new Date(reservationInfo.dueDate).toLocaleDateString('es-CO')}`, 20, currentY);
    currentY += 20;
    
  } else {
    // ✅ INFORMACIÓN DE VENTA NORMAL
    doc.text(`Monto sin descuento: $${Number(totalAmount).toLocaleString("es-CO")}`, 20, currentY);
    currentY += 20;

    if (discount > 0) {
      doc.text(`Descuento: ${discount}% ($${discountAmount.toLocaleString("es-CO")})`, 20, currentY);
      currentY += 20;
    }

    doc.text(`Monto Total: $${totalWithDiscount.toLocaleString("es-CO")}`, 20, currentY);
    currentY += 20;

    const displayAmount1 = amount1Param || totalWithDiscount;
    doc.text(`Método de Pago: ${paymentMethod} $${displayAmount1.toLocaleString("es-CO")}`, 20, currentY);
    currentY += 20;

    if (showSecondPayment && paymentMethod2 && amount2Param) {
      doc.text(`Método de Pago 2: ${paymentMethod2} $${amount2Param.toLocaleString("es-CO")}`, 20, currentY);
      currentY += 20;
    }
  }

  doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 20;

  // ✅ PRODUCTOS
  doc.setFontSize(9);
  doc.text("PRODUCTOS:", 20, currentY);
  currentY += 15;

  if (order.products && order.products.length > 0) {
    order.products.forEach((product, index) => {
      const productLine = `${index + 1}. ${product.description}`;
      const lines = doc.splitTextToSize(productLine, 170);
      doc.text(lines, 20, currentY);
      currentY += 12 * lines.length;
    });
  }

  currentY += 15;

  // ✅ OBSERVACIONES
  if (observations && observations.trim() !== "") {
    doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    doc.setFontSize(8);
    doc.text("OBSERVACIONES:", 20, currentY);
    currentY += 15;

    const observationLines = doc.splitTextToSize(observations.trim(), 180);
    doc.text(observationLines, 20, currentY);
    currentY += 12 * observationLines.length;
    currentY += 15;
  }

  // ✅ NOTA IMPORTANTE PARA RESERVAS
  if (isReservation && reservationInfo) {
    doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;
    
    doc.setFontSize(9);
    doc.text("⚠️ IMPORTANTE:", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 15;
    
    doc.setFontSize(8);
    doc.text("Esta es una RESERVA A CRÉDITO.", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 12;
    
    doc.text("El saldo pendiente debe cancelarse", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 12;
    
    doc.text(`antes del ${new Date(reservationInfo.dueDate).toLocaleDateString('es-CO')}`, doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 12;
    
    doc.text("para completar la compra.", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;
  }

  doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });
  currentY += 20;

  doc.setFontSize(10);
doc.text(
  `Atendido por: ${
    userInfo // ✅ CORREGIDO: user → userInfo
      ? `${userInfo.first_name} ${userInfo.last_name}`
      : cashierInfo
      ? `${cashierInfo.first_name} ${cashierInfo.last_name}`
      : "N/A"
  }`,
  20,
  currentY
);
currentY += 15;

// ✅ MOSTRAR DOCUMENTO DEL CAJERO
if (userInfo?.n_document || cashierInfo?.n_document) { // ✅ CORREGIDO: user → userInfo
  doc.text(
    `Cajero: ${userInfo?.n_document || cashierInfo?.n_document}`, // ✅ CORREGIDO: user → userInfo
    20,
    currentY
  );
  currentY += 15;
}

  doc.setFontSize(8);
  doc.text(`Orden: ${order.id_orderDetail}`, 20, currentY);
  currentY += 30;

  doc.setFontSize(12);
  doc.text("Gracias por elegirnos!", doc.internal.pageSize.width / 2, currentY, {
    align: "center",
  });

  doc.output("dataurlnewwindow");
};

  // ✅ MANEJO DE LOADING Y ERRORES
  if (loading || userLoading || cashierLoading || receiptsLoading) {
    return <p>Cargando detalles de la orden...</p>;
  }

  if (error || userError || cashierError || receiptsError) {
    const getErrorMsg = (err) =>
      typeof err === "string"
        ? err
        : err?.message || err?.error || JSON.stringify(err);

    return (
      <p>
        Error al cargar la orden:{" "}
        {getErrorMsg(error) ||
          getErrorMsg(userError) ||
          getErrorMsg(cashierError) ||
          getErrorMsg(receiptsError)}
      </p>
    );
  }

  if (!order || order.id_orderDetail !== idOrder) {
    return <p>No se encontró la orden</p>;
  }

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
        <h2 className="text-2xl font-semibold text-center mb-4">
          Formulario de Recibo
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Número de Recibo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Número de Recibo
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
                loadingCashier
                  ? "Cargando..."
                  : cashierInfo
                  ? `${cashierInfo.first_name} ${cashierInfo.last_name}`
                  : "N/A"
              }
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Datos del comprador */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Comprador
            </label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Descuento */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Descuento (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="0"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Monto de Descuento
            </label>
            <input
              type="number"
              value={discountAmount.toFixed(2)}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Monto Total
            </label>
            <input
              type="number"
              value={totalWithDiscount.toFixed(2)}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
            />
          </div>

          {/* Primer método de pago */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Método de Pago 1
            </label>
            <select
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>
                Seleccione un método
              </option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta de Débito o Crédito</option>
              <option value="Crédito">Reserva Crédito</option>
              <option value="Addi">Addi</option>
              <option value="Nequi">Nequi</option>
              <option value="Sistecredito">Sistecredito</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="Otro">Otro</option>
            </select>

            {showSecondPayment && (
              <input
                type="number"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
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
                setAmount1("");
                setAmount2("");
              }}
            >
              + Agregar otro método de pago
            </button>
          )}

          {/* Segundo método de pago */}
          {showSecondPayment && (
            <div className="mb-4 p-4 border border-gray-200 rounded">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Método de Pago 2
                </label>
                <button
                  type="button"
                  className="text-red-500 text-xs"
                  onClick={() => {
                    setShowSecondPayment(false);
                    setPaymentMethod2("");
                    setAmount1("");
                    setAmount2("");
                  }}
                >
                  Quitar
                </button>
              </div>
              <select
                value={paymentMethod2}
                onChange={(e) => setPaymentMethod2(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Seleccione</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta de Débito o Crédito</option>
                <option value="Crédito">Reserva Crédito</option>
                <option value="Addi">Addi</option>
                <option value="Sistecredito">Sistecredito</option>
                <option value="Nequi">Nequi</option>
                <option value="Bancolombia">Bancolombia</option>
                <option value="GiftCard">GiftCard</option>
                <option value="Otro">Otro</option>
              </select>
              <input
                type="number"
                value={amount2}
                onChange={(e) => setAmount2(e.target.value)}
                placeholder="Monto Método 2"
                required
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          )}

          {/* ✅ SECCIÓN DE EFECTIVO CORREGIDA */}
          {paymentMethod === "Efectivo" && !showSecondPayment && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Dinero Entregado
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashGiven}
                  onChange={handleCashGivenChange}
                  placeholder={`Mínimo: $${totalWithDiscount.toFixed(2)}`}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Vuelto
                </label>
                <input
                  type="text"
                  value={
                    change >= 0
                      ? `$${change.toFixed(2)}`
                      : `Faltan $${Math.abs(change).toFixed(2)}`
                  }
                  readOnly
                  className={`mt-1 block w-full px-3 py-2 border ${
                    change >= -0.01
                      ? "border-green-300 bg-green-50"
                      : "border-red-500 bg-red-50"
                  } rounded-md shadow-sm`}
                />
                {change >= 0 && change > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    ✅ Vuelto a entregar al cliente
                  </div>
                )}
                {change === 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    ✅ Pago exacto
                  </div>
                )}
                {change < 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    ❌ Dinero insuficiente
                  </div>
                )}
              </div>
            </>
          )}

          {/* ✅ OBSERVACIONES PARA TODOS LOS MÉTODOS */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observaciones adicionales sobre la venta..."
              rows="3"
              maxLength="500"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-xs text-gray-500 mt-1">
              {observations.length}/500 caracteres
            </div>
          </div>

          {/* Fecha */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              disabled={isSubmitted || loadingCashier}
            >
              Generar Recibo
            </button>

            {isSubmitted && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    generatePDF(
                      showSecondPayment ? Number(amount1) : totalWithDiscount,
                      showSecondPayment ? Number(amount2) : null
                    )
                  }
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Imprimir Recibo
                </button>
                <button
                  type="button"
                  onClick={handleExit}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Salir
                </button>
              </>
            )}
          </div>
        </form>

      {showReservationPopup && (
  <ReservationPopup
    orderId={order.id_orderDetail}
    totalAmount={Number(totalAmount)}
    onClose={() => {
      setShowReservationPopup(false);
      setPaymentMethod("Efectivo");
      setIsReservation(false);
      setReservationInfo(null);
    }}
    onSubmit={async (reservationData) => {
      try {
        console.log('🔵 Datos recibidos del popup:', reservationData);
        console.log('🔵 Orden actual:', order);
        console.log('🔵 Usuario logueado (cajero):', userInfo); // ✅ CORREGIDO: user → userInfo

        // ✅ OBTENER n_document DEL BUYER/CLIENTE
        let buyerDocument = null;
        if (order.User?.n_document) {
          buyerDocument = order.User.n_document;
        } else if (order.userData?.n_document) {
          buyerDocument = order.userData.n_document;
        } else if (order.n_document) {
          buyerDocument = order.n_document;
        }

        // ✅ OBTENER n_document DEL CAJERO (usuario logueado)
        const cashierDocument = userInfo?.n_document || cashierInfo?.n_document; // ✅ CORREGIDO: user → userInfo

        console.log('🔵 Documento del cliente (buyer):', buyerDocument);
        console.log('🔵 Documento del cajero:', cashierDocument);

        // ✅ VALIDACIONES
        if (!buyerDocument) {
          throw new Error('No se pudo obtener el documento del cliente');
        }

        if (!cashierDocument) {
          throw new Error('No se pudo obtener el documento del cajero');
        }

        if (!order.products || order.products.length === 0) {
          throw new Error('No hay productos en la orden');
        }

        // ✅ CONSTRUIR DATOS COMPLETOS PARA EL CONTROLADOR EXISTENTE
        const reservationBody = {
          // Datos básicos de la orden
          date: order.date || new Date().toISOString().split('T')[0],
          amount: order.amount || Number(totalAmount),
          quantity: order.quantity || 1,
          state_order: "Reserva a Crédito",
          
          // Productos de la orden existente
          products: order.products.map(product => ({
            id_product: product.id_product,
            quantity: product.OrderProduct?.quantity || 1
          })),
          
          // Direcciones
          address: order.address || "Retira en Local",
          deliveryAddress: order.deliveryAddress || null,
          shippingCost: order.shippingCost || 0,
          
          // ✅ DOCUMENTO DEL CLIENTE/BUYER
          n_document: buyerDocument,
          
          // Configuración de venta
          pointOfSale: order.pointOfSale || "Local",
          discount: order.discount || 0,
          
          // ✅ DATOS ESPECÍFICOS DE LA RESERVA
          partialPayment: Number(reservationData.partialPayment),
          dueDate: reservationData.dueDate,
          
          // ✅ DATOS DEL CAJERO (para auditoría)
          cashier_document: cashierDocument,
          
          // ✅ DATOS DEL COMPRADOR
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone
        };
        
        console.log('🔵 Body completo para crear reserva:', reservationBody);
        
        // ✅ USAR EL ENDPOINT EXISTENTE CON userId
        const userId = order.User?.id_user || buyerDocument;
        
        await dispatch(createReservation(userId, reservationBody));
        
        // ✅ Guardar información para el recibo
        setReservationInfo({
          partialPayment: Number(reservationData.partialPayment),
          dueDate: reservationData.dueDate,
          paymentMethod: reservationData.paymentMethod || "Efectivo",
          remainingAmount: Number(totalAmount) - Number(reservationData.partialPayment),
          buyerName: buyerName,
          buyerEmail: buyerEmail,
          buyerPhone: buyerPhone,
          buyerDocument: buyerDocument,
          cashierDocument: cashierDocument,
          cashierName: userInfo ? `${userInfo.first_name} ${userInfo.last_name}` : 'N/A' // ✅ CORREGIDO: user → userInfo
        });
        setIsReservation(true);
        
        setShowReservationPopup(false);
        
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Reserva creada correctamente.",
          confirmButtonText: "Continuar con el recibo"
        });
        
      } catch (error) {
        console.error('❌ Error al crear reserva:', error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo crear la reserva."
        });
        
        setPaymentMethod("Efectivo");
        setShowReservationPopup(false);
        setIsReservation(false);
        setReservationInfo(null);
      }
    }}
  />
)}
      </div>
    </div>
  );
};

export default Recibo;
