import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// ✅ Importar utilidades de fecha para Colombia
import { getColombiaDate, formatDateForDisplay, isValidDate } from "../utils/dateUtils";
import * as CryptoJS from "crypto-js"
import {
  initPaymentIntent,
  clearOrderState,
} from "../Redux/Actions/actions";
import Swal from "sweetalert2";
import imgFondo from '../assets/img/BannerPrincipal/banner3.png'
import Navbar from "./Navbar";
import PropTypes from 'prop-types';

const Checkout = () => {
  // ✅ Usar fecha de Colombia en lugar de UTC
  const currentDate = getColombiaDate();
  
  const location = useLocation();
  const { shippingType = 'Coordinar por WhatsApp', deliveryAddress: initialDeliveryAddress } = location.state || {};

  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log("Checkout Component Mount - Initial Shipping Type:", shippingType);
  console.log("Checkout Component Mount - Initial Delivery Address:", initialDeliveryAddress);
  console.log("Checkout Component Mount - Colombia Date:", currentDate);

  // Redux state selectors
  const cart = useSelector((state) => state.cart);
  const orderState = useSelector((state) => state.order);
  const paymentIntentState = orderState?.paymentIntent || {
    loading: false,
    success: false,
    data: null,
    error: null,
  };
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  console.log('>>> Checkout Component Render - order state:', JSON.stringify(orderState));

  // ✅ Local state con fecha correcta de Colombia
  const [orderData, setOrderData] = useState({
    date: currentDate, // ✅ Fecha de Colombia
    amount: cart.totalPrice,
    quantity: cart.totalItems,
    state_order: "Pedido Realizado",
    n_document: userInfo ? userInfo.n_document : "",
    products: cart.items.map(item => ({
      id_product: item.id_product,
      quantity: item.quantity,
      description: item.description || item.name,
      price: item.priceSell
    })),
    address: shippingType,
    deliveryAddress: shippingType === 'Envio a domicilio' ? initialDeliveryAddress : null,
    pointOfSale: 'Online',
    shippingCost: 0
  });

  useEffect(() => {
    return () => {
      dispatch(clearOrderState());
    };
  }, [dispatch]);

  // useEffect to open Wompi widget after successful payment intent initialization
  useEffect(() => {
    console.log('>>> Checkout useEffect (Wompi) - Start. PaymentIntent state:', JSON.stringify(paymentIntentState, null, 2));

    if (paymentIntentState.success && paymentIntentState.data?.wompi) {
      const { reference, integritySignature, amountInCents, currency = 'COP' } = paymentIntentState.data.wompi;

      if (!reference || !integritySignature || typeof amountInCents !== 'number') {
        console.error('>>> Checkout useEffect (Wompi) - Datos de Wompi incompletos:', paymentIntentState.data.wompi);
        Swal.fire('Error', 'Faltan datos para procesar el pago. Contacta a soporte.', 'error');
        return;
      }

      const publicKey = 'pub_prod_pbz8e9I6apsTsgdJHUfp05FQ6jf3vVDB'; // PRODUCTION KEY
      const redirectUrl = `https://bonita-seven.vercel.app/thank-you?orderRef=${reference}`;

      const widgetData = {
        currency,
        amountInCents,
        reference: String(reference),
        publicKey,
        redirectUrl,
        signature: {
          integrity: integritySignature,
        },
      };

      console.log('>>> Checkout useEffect (Wompi) - Wompi Widget Data Prepared:', widgetData);
      console.log(`>>> Checkout useEffect (Wompi) - Checking typeof WidgetCheckout: ${typeof WidgetCheckout}`);

      if (typeof WidgetCheckout !== 'undefined') {
        try {
          const checkout = new WidgetCheckout(widgetData);
          console.log('>>> Checkout useEffect (Wompi) - Opening Wompi widget...');
          checkout.open((result) => {
            console.log('>>> Checkout useEffect (Wompi) - Wompi Transaction Result:', result.transaction);
            if (result?.transaction?.status !== 'APPROVED') {
              dispatch(clearOrderState());
            }
          });
        } catch (widgetError) {
          console.error('>>> Checkout useEffect (Wompi) - ERROR creating/opening Wompi widget:', widgetError);
          Swal.fire('Error', `Error al iniciar Wompi: ${widgetError.message}`, 'error');
        }
      } else {
        console.error('>>> Checkout useEffect (Wompi) - ERROR: Wompi WidgetCheckout is not defined.');
        Swal.fire('Error', 'No se pudo cargar el componente de pago. Revisa tu conexión o intenta más tarde.', 'error');
      }
    } else if (paymentIntentState.error) {
      console.error('>>> Checkout useEffect (Wompi) - Payment intent failed:', paymentIntentState.error);
      Swal.fire('Error', paymentIntentState.error, 'error');
    } else {
      console.log('>>> Checkout useEffect (Wompi) - Awaiting payment intent data.');
    }

    console.log('>>> Checkout useEffect (Wompi) - End.');
  }, [paymentIntentState.success, paymentIntentState.data, paymentIntentState.error, dispatch]);

  // Update local order data if cart changes
  useEffect(() => {
    console.log(">>> Checkout useEffect (Cart Update) - Cart changed, updating orderData.");
    setOrderData((prevData) => ({
      ...prevData,
      products: cart.items.map(item => ({
        id_product: item.id_product,
        quantity: item.quantity,
        description: item.description || item.name,
        price: item.priceSell
      })),
      amount: cart.totalPrice,
      quantity: cart.totalItems,
    }));
  }, [cart.items, cart.totalPrice, cart.totalItems]);

  // Update local order data if navigation state (shippingType/address) changes
  useEffect(() => {
    console.log(">>> Checkout useEffect (Shipping Update) - Shipping info changed, updating orderData.");
    setOrderData(prev => ({
      ...prev,
      address: shippingType,
      deliveryAddress: shippingType === 'Envio a domicilio' ? initialDeliveryAddress : null
    }));
  }, [shippingType, initialDeliveryAddress]);

  // ✅ Manejar cambios en inputs del formulario con validación de fecha
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change: ${name} = ${value}`);
    
    // ✅ Validar fecha si es el campo de fecha
    if (name === 'date') {
      if (!isValidDate(value)) {
        Swal.fire("Error", "Por favor selecciona una fecha válida", "error");
        return;
      }
      
      // Validar que no sea una fecha futura
      const today = new Date(getColombiaDate());
      const selected = new Date(value);
      
      if (selected > today) {
        Swal.fire({
          icon: "warning",
          title: "Fecha inválida",
          text: "No se pueden crear órdenes con fecha futura.",
        });
        return;
      }
      
      console.log("Fecha seleccionada (Colombia):", value);
    }
    
    setOrderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle delivery address input change specifically
  const handleDeliveryAddressChange = (e) => {
    const newAddress = e.target.value;
    console.log(`Delivery address input change: ${newAddress}`);
    setOrderData(prev => ({
      ...prev,
      deliveryAddress: newAddress
    }));
  };

  // Handle form submission to create the order
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(">>> handleSubmit - Form submitted.");

    // ✅ Validaciones mejoradas incluyendo fecha
    if (!isValidDate(orderData.date)) {
      console.warn(">>> handleSubmit - Validation failed: Invalid date.");
      Swal.fire("Error", "Por favor selecciona una fecha válida", "error");
      return;
    }

    if (orderData.address === "Envio a domicilio" && !orderData.deliveryAddress) {
      console.warn(">>> handleSubmit - Validation failed: Delivery address required.");
      Swal.fire("Error", "Por favor ingresa la dirección de envío", "error");
      return;
    }
    
    if (!userInfo) {
      console.warn(">>> handleSubmit - Validation failed: User not logged in.");
      Swal.fire("Error", "Debes iniciar sesión para completar la compra.", "error");
      navigate('/login');
      return;
    }
    
    if (!userInfo.n_document) {
      console.warn(">>> handleSubmit - Validation failed: User n_document missing.");
      Swal.fire("Error", "Falta información del usuario (documento). Por favor, actualiza tu perfil.", "error");
      return;
    }

    // ✅ Datos finales con fecha correcta de Colombia
    const finalOrderData = {
      ...orderData,
      n_document: userInfo.n_document,
      date: orderData.date, // Ya está validada
      currency: 'COP',
      customerEmail: userInfo.email,
      customerName: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || userInfo.first_name || userInfo.last_name || userInfo.email,
      metadata: {
        cartItems: cart.items.map((item) => ({
          id_product: item.id_product,
          quantity: item.quantity,
          price: item.priceSell,
        })),
      },
    };

    console.log(">>> handleSubmit - Submitting Order Data with Colombia date:", finalOrderData);
    
    try {
      await dispatch(initPaymentIntent(finalOrderData));
      console.log(">>> handleSubmit - initPaymentIntent action dispatched.");
    } catch (error) {
      console.error(">>> handleSubmit - Error dispatching initPaymentIntent:", error);
      Swal.fire("Error", error.message || "Ocurrió un problema al intentar iniciar el pago.", "error");
    }
  };

  console.log(">>> Checkout Component Render - Rendering JSX...");
  
  return (
    <>
      <Navbar/>
      <div
        className="min-h-screen flex justify-center items-center bg-cover bg-center px-4"
        style={{ backgroundImage: `url(${imgFondo})`, paddingTop: '4rem' }}
      >
        <div className="max-w-lg w-full mx-auto p-10 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold font-monserrat mb-4 text-center">
            Finalizar Compra
          </h2>

          {/* ✅ Información de fecha actual de Colombia */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Fecha actual de Colombia:</strong> {formatDateForDisplay(getColombiaDate())}
            </p>
          </div>

          {/* Loading indicator while creating order */}
          {paymentIntentState.loading && <p className='text-center text-blue-500 font-semibold'>Iniciando pago...</p>}

          <form onSubmit={handleSubmit}>
            {/* ✅ Date Input mejorado */}
            <div className="mb-4">
              <label className="block text-sm font-semibold font-monserrat text-gray-700">
                Fecha de la Orden *
              </label>
              <input
                type="date"
                name="date"
                value={orderData.date}
                onChange={handleInputChange}
                min={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Hasta 7 días atrás
                max={getColombiaDate()} // No fechas futuras
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
              {/* ✅ Mostrar fecha formateada */}
              <p className="text-sm text-gray-600 mt-1">
                Fecha seleccionada: {formatDateForDisplay(orderData.date)}
              </p>
            </div>

            {/* Shipping Type Display */}
            <div className="mb-4">
              <label className="block text-sm font-semibold font-monserrat text-gray-700">
                Tipo de entrega:
              </label>
              <input
                type="text"
                value={orderData.address}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            {/* Conditional Delivery Address Input */}
            {orderData.address === "Envio a domicilio" && (
              <div className="mb-4">
                <label className="block text-sm font-monserrat font-semibold text-gray-700">
                  Dirección de envío: *
                </label>
                <input
                  id="deliveryAddress"
                  type="text"
                  value={orderData.deliveryAddress || ''}
                  onChange={handleDeliveryAddressChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  placeholder="Ingresa calle, número, ciudad, etc."
                />
              </div>
            )}

            {/* Order Summary */}
            <div className="mb-4 border-t pt-4">
              <h3 className="text-xl font-semibold font-monserrat mb-2">
                Resumen del Pedido
              </h3>
              <ul className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <li key={item.id_product} className="py-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className='flex-1 mr-2'>{item.description || item.name} (x{item.quantity})</span>
                      <span className='text-right font-medium'>${(item.quantity * item.priceSell).toLocaleString('es-CO')}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-4 pt-2 border-t uppercase font-semibold">
                <span>Total ({cart.totalItems} items):</span>
                <span>${cart.totalPrice.toLocaleString('es-CO')}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
              disabled={paymentIntentState.loading || paymentIntentState.success || cart.items.length === 0}
            >
              {paymentIntentState.loading ? "Procesando..." : (paymentIntentState.success ? "Pago Iniciado" : "Proceder al Pago")}
            </button>

            {/* Display Order Creation Error */}
            {paymentIntentState.error && !paymentIntentState.loading && (
              <div className="text-red-500 mt-2 text-center font-semibold">{paymentIntentState.error}</div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

// PropTypes for props passed via navigation state
Checkout.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      shippingType: PropTypes.string,
      deliveryAddress: PropTypes.string,
    }),
  }),
};

export default Checkout;