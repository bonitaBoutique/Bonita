import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import axios from "axios"; // ✅ IMPORTAR axios para GiftCard validation
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
  getServerTime,
} from "../Redux/Actions/actions";
import ReservationPopup from "./ReservationPopup";
import {
  getColombiaDate,
  formatDateForDisplay,
  isValidDate,
  getServerDate,
  getDateForInput,
  validateDateNotFuture,
} from "../utils/dateUtils";
import ServerTimeSync from "./ServerTimeSync";
import { BASE_URL } from "../Config"; // ✅ IMPORTAR BASE_URL para GiftCard API

const Recibo = () => {
  const { idOrder } = useParams();
  const { n_document } = useParams();

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

  const serverTime = useSelector((state) => state.serverTime);

  // ✅ ESTADOS LOCALES
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [showSecondPayment, setShowSecondPayment] = useState(false);
  const [paymentMethod2, setPaymentMethod2] = useState("");
  const [amount1, setAmount1] = useState("");
  
  // ✅ ESTADOS PARA GIFTCARD
  const [giftCardEmail, setGiftCardEmail] = useState("");
  const [giftCardBalance, setGiftCardBalance] = useState(0);
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [giftCardValidated, setGiftCardValidated] = useState(false);
  const [amount2, setAmount2] = useState("");
  const [loadingCashier, setLoadingCashier] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [date, setDate] = useState(() => {
    return getColombiaDate();
  });
  const [cashGiven, setCashGiven] = useState("");
  const [change, setChange] = useState(0);
  const [observations, setObservations] = useState("");
  const [reservationInfo, setReservationInfo] = useState(null);
  const [isReservation, setIsReservation] = useState(false);
  const [showReservationPopup, setShowReservationPopup] = useState(false);

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
    setDate(getDateForInput(serverTime) || getColombiaDate());
    setCashGiven("");
    setChange(0);
    setDiscount(0);
    setObservations("");
    setIsSubmitted(false);
    setIsReservation(false);
    setReservationInfo(null);
    setShowReservationPopup(false);
  };

  const handleExit = () => {
    dispatch(resetReceiptState());
    dispatch(clearOrderState());
    navigate("/panel/caja");
  };

  // ✅ EFFECTS
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await dispatch(getServerTime());
        
        if (!order || order.id_orderDetail !== idOrder) {
          await dispatch(fetchOrdersByIdOrder(idOrder));
        }
        if (!receiptNumber) {
          await dispatch(fetchLatestReceipt());
        }
        await dispatch(fetchLatestOrder());
      } catch (error) {
        console.error('❌ [Recibo] Error inicializando:', error);
      }
    };

    initializeComponent();
  }, [dispatch, idOrder, order, receiptNumber]);

  useEffect(() => {
    if (serverTime && !serverTime.loading && serverTime.current?.date) {
      const currentServerDate = getServerDate(serverTime);
      if (currentServerDate) {
        console.log('🕒 [Recibo] Actualizando fecha con servidor:', currentServerDate);
        setDate(getDateForInput(serverTime));
      }
    }
  }, [serverTime]);

  useEffect(() => {
    if (order && order.id_orderDetail === idOrder) {
      setTotalAmount(order.amount);
      
      const serverDate = getServerDate(serverTime);
      if (serverDate) {
        setDate(getDateForInput(serverTime));
      } else if (order.date) {
        setDate(order.date);
      }
      
      if (order.User) {
        setBuyerName(`${order.User.first_name} ${order.User.last_name}`);
        setBuyerEmail(order.User.email);
        setBuyerPhone(order.User.phone || "");
      } else if (order.userData) {
        setBuyerName(`${order.userData.first_name} ${order.userData.last_name}`);
        setBuyerEmail(order.userData.email);
        setBuyerPhone(order.userData.phone || "");
      } else {
        setBuyerName("");
        setBuyerEmail("");
        setBuyerPhone("");
      }
      
      setAmount1("");
      setAmount2("");
      setShowSecondPayment(false);
      setPaymentMethod2("");
    }
  }, [order, idOrder, dispatch, serverTime]);

  useEffect(() => {
    if (userInfo && userInfo.n_document) {
      setLoadingCashier(true);
      console.log('🔵 [Recibo] Cargando datos del cajero para:', userInfo.n_document);
      console.log('🔵 [Recibo] userInfo completo:', userInfo);
      
      dispatch(fetchUserByDocument(userInfo.n_document)).finally(() => {
        setLoadingCashier(false);
      });
    }
  }, [userInfo, dispatch]);

  // ✅ DEBUG: Verificar cashierInfo cuando cambie
  useEffect(() => {
    console.log('👤 [Recibo] cashierInfo actualizado:', cashierInfo);
    console.log('👤 [Recibo] userInfo actual:', userInfo);
  }, [cashierInfo, userInfo]);

  // ✅ FUNCIÓN PARA VALIDAR GIFTCARD
  const validateGiftCard = async (email) => {
    if (!email) return;
    
    setGiftCardLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/giftcard/balance/${encodeURIComponent(email)}`);
      const balance = response.data?.saldo || 0;
      
      setGiftCardBalance(balance);
      setGiftCardValidated(true);
      
      if (balance <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin saldo disponible',
          text: 'Esta GiftCard no tiene saldo disponible o no existe.'
        });
        return false;
      }
      
      console.log('✅ GiftCard validada:', { email, balance });
      return true;
    } catch (error) {
      console.error('❌ Error validando GiftCard:', error);
      setGiftCardBalance(0);
      setGiftCardValidated(false);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo validar la GiftCard. Verifica el email.'
      });
      return false;
    } finally {
      setGiftCardLoading(false);
    }
  };

  // ✅ MANEJO DE MÉTODOS DE PAGO
  const handlePaymentMethodChange = async (e) => {
    const value = e.target.value;
    setPaymentMethod(value);
    setShowSecondPayment(false);
    setPaymentMethod2("");
    setAmount1("");
    setAmount2("");
    
    // ✅ LIMPIAR ESTADOS DE GIFTCARD
    setGiftCardEmail("");
    setGiftCardBalance(0);
    setGiftCardValidated(false);

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
    } else if (value === "GiftCard") {
      // ✅ AUTOCOMPLETAR EMAIL SI ESTÁ DISPONIBLE
      if (buyerEmail) {
        setGiftCardEmail(buyerEmail);
        await validateGiftCard(buyerEmail);
      }
    }
  };

  const handleCashGivenChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setCashGiven(value);

    const totalAmount = Number(totalWithDiscount);
    const changeAmount = value - totalAmount;
    setChange(Math.round(changeAmount * 100) / 100);
  };

  // ✅ FUNCIÓN HANDLESUBMIT CORREGIDA
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDACIÓN DE FECHA
    if (!date || !isValidDate(date)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor selecciona una fecha válida.",
      });
      return;
    }

    // ✅ VALIDAR QUE LA FECHA NO SEA FUTURA
    const validation = validateDateNotFuture(date, serverTime, 'Fecha del recibo');
    if (!validation.valid) {
      Swal.fire({
        icon: "warning",
        title: "Fecha futura",
        text: validation.message,
      });
      return;
    }

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

    // Validación para efectivo
    if (paymentMethod === "Efectivo" && !showSecondPayment) {
      const cashAmount = Number(cashGiven);
      const totalAmount = Number(totalWithDiscount);

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

    // ✅ Validación para GiftCard
    if (paymentMethod === "GiftCard" && !showSecondPayment) {
      if (!giftCardValidated) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debes validar la GiftCard antes de procesar el pago.",
        });
        return;
      }

      if (giftCardBalance < totalWithDiscount) {
        Swal.fire({
          icon: "error",
          title: "Saldo insuficiente",
          text: `La GiftCard solo tiene $${giftCardBalance.toLocaleString('es-CO')} disponibles. Agrega un segundo método de pago.`,
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
      // ✅ AGREGAR: Datos de GiftCard para descuento automático
      giftCardEmail: paymentMethod === "GiftCard" ? giftCardEmail : null,
      giftCardBalance: paymentMethod === "GiftCard" ? giftCardBalance : null,
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

    // ✅ USAR formatDateForDisplay
    doc.text(`Fecha: ${formatDateForDisplay(date)}`, doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

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

    if (isReservation && reservationInfo?.buyerDocument) {
      doc.text(`Documento: ${reservationInfo.buyerDocument}`, 20, currentY);
      currentY += 20;
    }

    doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

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

    // ✅ INFORMACIÓN DEL CAJERO CORREGIDA
    doc.setFontSize(10);
    
    // Determinar el nombre del cajero de las diferentes fuentes posibles
    let cashierName = "N/A";
    
    if (cashierInfo && cashierInfo.first_name && cashierInfo.last_name) {
      cashierName = `${cashierInfo.first_name} ${cashierInfo.last_name}`;
    } else if (userInfo && userInfo.first_name && userInfo.last_name) {
      cashierName = `${userInfo.first_name} ${userInfo.last_name}`;
    }
    
    console.log('📄 [PDF] Datos para cajero:', { userInfo, cashierInfo, cashierName });
    
    doc.text(
      `Atendido por: ${cashierName}`,
      20,
      currentY
    );
    currentY += 20;

    doc.setFontSize(8);
    doc.text(`Orden: ${order.id_orderDetail}`, 20, currentY);
    currentY += 20;

    // ✅ SECCIÓN: DETALLE DE IMPUESTOS
    doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 15;

    doc.setFontSize(7);
    doc.text("DETALLE DE LOS IMPUESTOS", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 12;

    // Calcular IVA (19% del total)
    const baseImponible = totalWithDiscount / 1.19;
    const ivaAmount = totalWithDiscount - baseImponible;

    doc.setFontSize(6);
    doc.text("Tarifa    Compra    Base/Imp    IMP", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 10;

    doc.text(
      `IVA 19%   $${totalWithDiscount.toLocaleString("es-CO")}   $${Math.round(baseImponible).toLocaleString("es-CO")}   $${Math.round(ivaAmount).toLocaleString("es-CO")}`,
      doc.internal.pageSize.width / 2,
      currentY,
      { align: "center" }
    );
    currentY += 12;

    doc.text(
      `FORMA DE PAGO: ${isReservation ? "Reserva a Crédito" : "Contado"}`,
      doc.internal.pageSize.width / 2,
      currentY,
      { align: "center" }
    );
    currentY += 15;

    doc.setFontSize(5);
    doc.text(
      "Bienes Exentos - Decreto 417 del 17 de Marzo de 2020",
      doc.internal.pageSize.width / 2,
      currentY,
      { align: "center" }
    );
    currentY += 15;

    doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 12;

    // ✅ SERVICIO AL CLIENTE
    doc.setFontSize(6);
    doc.text("Servicio al cliente", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 10;

    doc.text("311 8318191 - bonitaboutiquecumaral@gmail.com", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 15;

    // ✅ POLÍTICA DE PROTECCIÓN DE DATOS
    doc.setFontSize(5);
    const politicaLines = doc.splitTextToSize(
      "Por virtud del decreto 1377 de 2013 y su Art. 7, manifiesto que he autorizado la recolección, almacenamiento y tratamiento de mi información para fines netamente comerciales. Consulta política de protección de datos en:",
      200
    );
    doc.text(politicaLines, doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 8 * politicaLines.length;

    doc.setFontSize(5);
    doc.text(
      "https://www.bonitaboutiquecumaral.com/politicadedatos",
      doc.internal.pageSize.width / 2,
      currentY,
      { align: "center" }
    );
    currentY += 15;

    doc.setFontSize(10);
    doc.text("Gracias por elegirnos!", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });

    doc.output("dataurlnewwindow");
  };

  // ✅ MANEJO DE LOADING Y ERRORES
  if (loading || userLoading || cashierLoading || receiptsLoading || serverTime?.loading) {
    return (
      <ServerTimeSync showDebug={false}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {serverTime?.loading ? 'Sincronizando con servidor...' : 'Cargando detalles de la orden...'}
            </p>
          </div>
        </div>
      </ServerTimeSync>
    );
  }

  if (error || userError || cashierError || receiptsError) {
    const getErrorMsg = (err) =>
      typeof err === "string"
        ? err
        : err?.message || err?.error || JSON.stringify(err);

    return (
      <ServerTimeSync showDebug={false}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              ❌ Error al cargar datos
            </h3>
            <p className="text-red-600 mb-4">
              {getErrorMsg(error) ||
                getErrorMsg(userError) ||
                getErrorMsg(cashierError) ||
                getErrorMsg(receiptsError)}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
            >
              🔄 Recargar página
            </button>
          </div>
        </div>
      </ServerTimeSync>
    );
  }

  if (!order || order.id_orderDetail !== idOrder) {
    return (
      <ServerTimeSync showDebug={false}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No se encontró la orden
            </h3>
            <p className="text-gray-500 mb-4">
              La orden con ID {idOrder} no existe o no se pudo cargar.
            </p>
            <button
              onClick={() => navigate("/panel")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              ← Volver al Panel
            </button>
          </div>
        </div>
      </ServerTimeSync>
    );
  }

  return (
    <ServerTimeSync showDebug={false}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/panel")}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-8 ml-40 hover:bg-gray-600 transition-colors"
          >
            ← Volver
          </button>
          
          <button
            onClick={() => dispatch(getServerTime())}
            className="bg-indigo-500 text-white px-3 py-2 rounded mt-8 mr-40 hover:bg-indigo-600 transition-colors text-sm"
            title="Sincronizar con servidor"
          >
            🕒 Sync Servidor
          </button>
        </div>

        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-md mt-16">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Formulario de Recibo
          </h2>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">
              <strong>📅 Fecha actual del servidor (Colombia):</strong>{" "}
              {formatDateForDisplay(getServerDate(serverTime) || getColombiaDate())}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              🕒 Zona horaria: America/Bogota (UTC-5) | 
              Estado: {serverTime?.loading ? 'Sincronizando...' : serverTime?.current ? 'Conectado' : 'Desconectado'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Nequi">Nequi</option>
                <option value="Daviplata">Daviplata</option>
                <option value="Sistecredito">Sistecredito</option>
                <option value="Addi">Addi</option>
                <option value="Bancolombia">Bancolombia</option>
                <option value="GiftCard">GiftCard</option>
                <option value="Crédito">Reserva Crédito</option>
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
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Sistecredito">Sistecredito</option>
                  <option value="Addi">Addi</option>
                  <option value="Bancolombia">Bancolombia</option>
                  <option value="GiftCard">GiftCard</option>
                  <option value="Crédito">Reserva Crédito</option>
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
                  {change < -0.01 && (
                    <div className="text-xs text-red-600 mt-1">
                      ❌ Monto insuficiente
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ✅ NUEVA SECCIÓN: GiftCard */}
            {paymentMethod === "GiftCard" && !showSecondPayment && (
              <div className="mb-4 p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                <h4 className="text-sm font-medium text-purple-800 mb-3">🎁 Pago con GiftCard</h4>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Email del cliente (GiftCard)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={giftCardEmail}
                      onChange={(e) => setGiftCardEmail(e.target.value)}
                      placeholder="email@cliente.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => validateGiftCard(giftCardEmail)}
                      disabled={!giftCardEmail || giftCardLoading}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                      {giftCardLoading ? "..." : "Validar"}
                    </button>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    💡 Se autocompletó con el email del comprador
                  </p>
                </div>

                {giftCardValidated && (
                  <div className="mb-3 p-3 bg-white rounded border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Saldo disponible:</span>
                      <span className={`text-lg font-bold ${
                        giftCardBalance >= totalWithDiscount ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        ${giftCardBalance.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Total a pagar:</span>
                      <span className="text-lg font-semibold text-gray-800">
                        ${totalWithDiscount.toLocaleString('es-CO')}
                      </span>
                    </div>
                    {giftCardBalance >= totalWithDiscount ? (
                      <div className="mt-2 p-2 bg-green-100 rounded">
                        <p className="text-sm text-green-800">
                          ✅ Saldo suficiente para esta compra
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Saldo restante después del pago: ${(giftCardBalance - totalWithDiscount).toLocaleString('es-CO')}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 p-2 bg-orange-100 rounded">
                        <p className="text-sm text-orange-800">
                          ⚠️ Saldo insuficiente
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          Faltan: ${(totalWithDiscount - giftCardBalance).toLocaleString('es-CO')}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSecondPayment(true);
                            setAmount1(giftCardBalance);
                            setAmount2(totalWithDiscount - giftCardBalance);
                          }}
                          className="mt-2 text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                        >
                          + Agregar segundo método de pago
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!giftCardValidated && (
                  <div className="p-3 bg-gray-100 rounded text-center">
                    <p className="text-sm text-gray-600">
                      Ingresa el email y valida la GiftCard para continuar
                    </p>
                  </div>
                )}
              </div>
            )}

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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={getDateForInput(serverTime)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatDateForDisplay(date)}
              </p>
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
                  console.log('🔵 Usuario logueado (cajero):', userInfo);

                  let buyerDocument = null;
                  if (order.User?.n_document) {
                    buyerDocument = order.User.n_document;
                  } else if (order.userData?.n_document) {
                    buyerDocument = order.userData.n_document;
                  } else if (order.n_document) {
                    buyerDocument = order.n_document;
                  }

                  const cashierDocument = userInfo?.n_document || cashierInfo?.n_document;

                  console.log('🔵 Documento del cliente (buyer):', buyerDocument);
                  console.log('🔵 Documento del cajero:', cashierDocument);

                  if (!buyerDocument) {
                    throw new Error('No se pudo obtener el documento del cliente');
                  }

                  if (!cashierDocument) {
                    throw new Error('No se pudo obtener el documento del cajero');
                  }

                  const reservationBody = {
                    date: order.date || new Date().toISOString().split('T')[0],
                    amount: order.amount || Number(totalAmount),
                    quantity: order.quantity || 1,
                    state_order: "Reserva a Crédito",
                    products: order.products?.map(product => ({
                      id_product: product.id_product,
                      quantity: product.OrderProduct?.quantity || 1
                    })) || [],
                    address: order.address || "Retira en Local",
                    
                    deliveryAddress: order.deliveryAddress || null,
                    shippingCost: order.shippingCost || 0,
                    n_document: buyerDocument,
                    pointOfSale: order.pointOfSale || "Local",
                    discount: order.discount || 0,
                    
                    partialPayment: Number(reservationData.partialPayment),
                    dueDate: reservationData.dueDate,
                    
                    cashier_document: cashierDocument,
                    buyer_name: buyerName,
                    buyer_email: buyerEmail,
                    buyer_phone: buyerPhone,
                    paymentMethod: reservationData.paymentMethod,
                    
                    id_orderDetail: order.id_orderDetail,
                    isReservation: true
                  };
                  
                  console.log('🔵 Body completo para crear reserva:', JSON.stringify(reservationBody, null, 2));
                  
                  const result = await dispatch(createReservation(order.id_orderDetail, reservationBody));
                  
                  console.log('🟢 Resultado de la reserva:', result);
                  
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
                    cashierName: userInfo ? `${userInfo.first_name} ${userInfo.last_name}` : 'N/A'
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
                  console.error('❌ Error detallado al crear reserva:', {
                    message: error.message,
                    stack: error.stack,
                    status: error.status,
                    data: error.data
                  });
                  
                  let errorMessage = 'No se pudo crear la reserva.';
                  
                  if (error.message.includes('Not enough stock')) {
                    errorMessage = 'El stock ya fue descontado al crear la orden original. Este error no debería ocurrir para reservas.';
                  } else if (error.message.includes('Missing Ordering Data')) {
                    errorMessage = 'Faltan datos necesarios para crear la reserva. Verifique que la orden tenga todos los datos requeridos.';
                  } else if (error.message.includes('Order not found')) {
                    errorMessage = 'No se encontró la orden especificada.';
                  } else if (error.message) {
                    errorMessage = error.message;
                  }
                  
                  Swal.fire({
                    icon: "error",
                    title: "Error al crear reserva",
                    text: errorMessage,
                    footer: `<small>Código de error: ${error.status || 'Unknown'}</small>`
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
    </ServerTimeSync>
  );
};

export default Recibo;