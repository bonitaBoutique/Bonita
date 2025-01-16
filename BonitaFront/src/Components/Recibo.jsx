import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import { fetchOrdersByIdOrder, fetchLatestReceipt, createReceipt, fetchLatestOrder, fetchUserByDocument } from "../Redux/Actions/actions";

const Recibo = () => {
  const { idOrder } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

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

  useEffect(() => {
    // Carga la orden solo si no está cargada o si el id no coincide
    if (!order || order.id_orderDetail !== idOrder) {
      dispatch(fetchOrdersByIdOrder(idOrder));
    }

    // Despacha la acción para obtener el último número de recibo si no se ha cargado
    if (!receiptNumber) {
      dispatch(fetchLatestReceipt());
    }

    // Despacha la acción para obtener la última orden
    dispatch(fetchLatestOrder());
  }, [dispatch, idOrder, order, receiptNumber]);

  useEffect(() => {
    if (order && order.id_orderDetail === idOrder) {
      setTotalAmount(order.amount);
      setDate(order.date);

      // Despacha la acción para obtener la información del usuario
      dispatch(fetchUserByDocument(order.n_document));
    }
  }, [order, idOrder, dispatch]);

  useEffect(() => {
    if (userInfo && userInfo.data) {
      const userData = userInfo.data;
      setBuyerName(`${userData.first_name} ${userData.last_name}`);
      setBuyerEmail(userData.email);
      setBuyerPhone(userData.phone);
    }
  }, [userInfo]);

  useEffect(() => {
    if (receiptCreated && payMethod !== 'Efectivo') {
      const checkout = new WidgetCheckout({
        currency: "COP",
        amountInCents: totalAmount * 100,
        reference: String(idOrder),
        publicKey: "pub_test_udFLMPgs8mDyKqs5bRCWhpwDhj2rGgFw",
        redirectUrl: "/pago",
        integritySignature: latestOrder.data.integritySignature,
      });
      console.log(checkout);
      checkout.open((result) => {
        const transaction = result.transaction;
        if (transaction.status === "APPROVED") {
          Swal.fire("Success", "Payment successful", "success");
        } else {
          Swal.fire("Error", "Payment failed", "error");
        }
      });
    }
  }, [receiptCreated, payMethod, totalAmount, idOrder, latestOrder]);

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

    const receiptData = {
      receiptNumber: newReceiptNumber,  // Número de recibo calculado
      total_amount: parseFloat(totalAmount), // Monto total (asegurarse de que es un número)
      date: date,  // Fecha de la orden
      id_orderDetail: order.id_orderDetail,  // ID de la orden
      buyer_name: buyerName,  // Nombre del comprador
      buyer_email: buyerEmail,  // Correo electrónico del comprador
      buyer_phone: buyerPhone,  // Teléfono del comprador
      payMethod: payMethod
    };

    console.log("Enviando datos al backend:", receiptData);

    try {
      // Despacha la acción para crear el recibo con los datos
      await dispatch(createReceipt(receiptData));
      // Aquí actualizas el estado para mostrar el mensaje de éxito
      setReceiptCreated(true);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message || "Error al crear el recibo");
    }

    // Opcional: Puedes hacer un reset del formulario si lo deseas
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
    doc.text(`Metodo de Pago : ${payMethod}`, 20, currentY);
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
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-md mt-24">
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

      <form onSubmit={handleSubmit}>
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
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>Seleccione un método</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Débito">Tarjeta de Débito</option>
            <option value="Tarjeta de Crédito">Crédito</option>
            <option value="Addi">Addi</option>
            <option value="Sistecredito">Sistecredito</option>
            <option value="Bancolombia">Bancolombia</option>
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

        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Crear Recibo
        </button>
      </form>

      {payMethod !== 'Efectivo' && (
        <div className="mt-4">
          <button
            onClick={() => {
              const checkout = new WidgetCheckout({
                currency: "COP",
                amountInCents: totalAmount * 100,
                reference: String(newReceiptNumber),
                publicKey: "pub_test_udFLMPgs8mDyKqs5bRCWhpwDhj2rGgFw",
                redirectUrl: "/pago",
                integritySignature: latestOrder.data.integritySignature,
              });
              checkout.open((result) => {
                const transaction = result.transaction;
                if (transaction.status === "APPROVED") {
                  Swal.fire("Success", "Payment successful", "success");
                } else {
                  Swal.fire("Error", "Payment failed", "error");
                }
              });
            }}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Pagar con Wompi
          </button>
        </div>
      )}

      <button
        onClick={generatePDF}
        className="mt-4 w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Descargar Recibo como PDF
      </button>
    </div>
  );
};

export default Recibo;
