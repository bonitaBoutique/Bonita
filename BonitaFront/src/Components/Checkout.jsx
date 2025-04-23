import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { BASE_URL } from "../Config"; // BASE_URL not used directly here
import * as CryptoJS from "crypto-js" // crypto-js not used in this version, but keep if needed elsewhere
// import axios from "axios"; // axios not used directly here
import {
  createOrder,
  clearOrderState, // Keep clearOrderState if needed elsewhere
  // fetchLatestOrder, // Remove fetchLatestOrder import
} from "../Redux/Actions/actions";
import Swal from "sweetalert2";
import imgFondo from '../assets/img/BannerPrincipal/banner3.png'
import Navbar from "./Navbar";
import PropTypes from 'prop-types';

// Declare WidgetCheckout globally if it's loaded via script tag
// This helps linters and clarifies intent.
/* global WidgetCheckout */

const Checkout = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const location = useLocation();
  // Default shippingType from navigation state or fallback
  const { shippingType = 'Coordinar por WhatsApp', deliveryAddress: initialDeliveryAddress } = location.state || {};

  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log("Checkout Component Mount - Initial Shipping Type:", shippingType);
  console.log("Checkout Component Mount - Initial Delivery Address:", initialDeliveryAddress);

  // Redux state selectors
  const cart = useSelector((state) => state.cart);
  const orderCreate = useSelector((state) => state.order);
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // *** LOG PARA CADA RENDERIZADO DEL COMPONENTE ***
  console.log('>>> Checkout Component Render - orderCreate State:', JSON.stringify(orderCreate));
  // ************************************************

  // Local state for the order form data
  const [orderData, setOrderData] = useState({
    date: currentDate,
    amount: cart.totalPrice,
    quantity: cart.totalItems,
    state_order: "Pedido Realizado",
    n_document: userInfo ? userInfo.n_document : "",
    products: cart.items.map(item => ({
      id_product: item.id_product,
      quantity: item.quantity,
      description: item.description || item.name, // Use name as fallback description
      price: item.priceSell
    })),
    address: shippingType, // Use initial shippingType
    deliveryAddress: shippingType === 'Envio a domicilio' ? initialDeliveryAddress : null, // Use initial address if applicable
    pointOfSale: 'Online',
    shippingCost: 0
  });

  // useEffect to open Wompi widget after successful order creation
  useEffect(() => {
    console.log('>>> Checkout useEffect (Wompi) - Start. State:', JSON.stringify(orderCreate, null, 2));

    console.log(`>>> Checkout useEffect (Wompi) - Checking condition: success=${orderCreate.success}, hasWompiData=${!!orderCreate.order?.wompiData}`);

    if (orderCreate.success && orderCreate.order?.wompiData) {
      console.log('>>> Checkout useEffect (Wompi) - Condition MET. Proceeding with Wompi.');
      const { referencia, integritySignature, amount } = orderCreate.order.wompiData;

      // Detailed validation of Wompi data
      if (!referencia || !integritySignature || typeof amount !== 'number') {
          console.error(">>> Checkout useEffect (Wompi) - ERROR: Datos de Wompi incompletos:", orderCreate.order.wompiData);
          Swal.fire("Error", "Faltan datos para procesar el pago. Contacta a soporte.", "error");
          // Consider dispatching clearOrderState here if appropriate
          // dispatch(clearOrderState());
          return; // Exit if data is incomplete
      }

      const currency = "COP";
      // Ensure you use the correct public key for the environment (test/prod)
      const publicKey = "pub_prod_pbz8e9I6apsTsgdJHUfp05FQ6jf3vVDB"; // PRODUCTION KEY
      // const publicKey = "pub_test_..."; // Use your TEST key during development
      const redirectUrl = `https://bonita-seven.vercel.app/thank-you?orderRef=${referencia}`; // Your production redirect URL

      const widgetData = {
        currency,
        amountInCents: amount, // Should be in cents from backend
        reference: String(referencia),
        publicKey: publicKey,
        redirectUrl: redirectUrl,
        // customerData: { // Optional: Add customer data if available and needed
        //   email: userInfo?.email,
        //   fullName: userInfo?.name, // Adjust field names as per your userInfo structure
        //   phoneNumber: userInfo?.phone,
        // },
        signature: {
           integrity: integritySignature
        }
      };
      console.log('>>> Checkout useEffect (Wompi) - Wompi Widget Data Prepared:', widgetData);

      // Check if Wompi's WidgetCheckout is available
      console.log(`>>> Checkout useEffect (Wompi) - Checking typeof WidgetCheckout: ${typeof WidgetCheckout}`);

      if (typeof WidgetCheckout !== 'undefined') {
           console.log('>>> Checkout useEffect (Wompi) - WidgetCheckout defined. Creating instance...');
           try {
               const checkout = new WidgetCheckout(widgetData);
               console.log('>>> Checkout useEffect (Wompi) - Opening Wompi widget...');
               checkout.open((result) => {
                   // This callback executes after the Wompi widget interaction is complete (closed or transaction finished)
                   console.log(">>> Checkout useEffect (Wompi) - Wompi Transaction Result:", result.transaction);
                   // You might want to clear the order state here or navigate based on the result
                   // dispatch(clearOrderState());
                   // Example: Navigate based on status
                   // if (result.transaction?.status === 'APPROVED') {
                   //   navigate(`/thank-you?orderRef=${referencia}&status=approved`);
                   // } else {
                   //   navigate(`/checkout?orderRef=${referencia}&status=${result.transaction?.status || 'unknown'}`);
                   // }
               });
               console.log('>>> Checkout useEffect (Wompi) - checkout.open() called.');
               // Consider clearing state immediately after opening if needed
               // dispatch(clearOrderState());
           } catch (widgetError) {
               console.error(">>> Checkout useEffect (Wompi) - ERROR creating/opening Wompi widget:", widgetError);
               Swal.fire("Error", `Error al iniciar Wompi: ${widgetError.message}`, "error");
               // dispatch(clearOrderState());
           }
       } else {
           console.error(">>> Checkout useEffect (Wompi) - ERROR: Wompi WidgetCheckout is not defined.");
           Swal.fire("Error", "No se pudo cargar el componente de pago. Revisa tu conexión o intenta más tarde.", "error");
           // dispatch(clearOrderState());
       }

    } else if (orderCreate.error) {
      console.error(">>> Checkout useEffect (Wompi) - Order creation failed:", orderCreate.error);
      // Optionally show error to user via Swal or other means
      // Swal.fire("Error", `No se pudo crear la orden: ${orderCreate.error}`, "error");
      // Consider clearing state on error to allow retry
      // dispatch(clearOrderState());
    } else {
        console.log('>>> Checkout useEffect (Wompi) - Condition NOT met (Not success or no Wompi data).');
    }
    console.log('>>> Checkout useEffect (Wompi) - End.');

  }, [orderCreate.success, orderCreate.order?.id_orderDetail, orderCreate.error, dispatch]); // Dependencies


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
  }, [cart.items, cart.totalPrice, cart.totalItems]); // More specific dependencies

  // Update local order data if navigation state (shippingType/address) changes
  useEffect(() => {
    console.log(">>> Checkout useEffect (Shipping Update) - Shipping info changed, updating orderData.");
    setOrderData(prev => ({
      ...prev,
      address: shippingType,
      deliveryAddress: shippingType === 'Envio a domicilio' ? initialDeliveryAddress : null
    }));
  }, [shippingType, initialDeliveryAddress]);


  // Handle generic input changes for the form (if any were editable)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change: ${name} = ${value}`);
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

    // Validation before submitting
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
        // Optionally navigate to profile page: navigate('/profile');
        return;
    }

    // Ensure n_document is correctly set from userInfo
    const finalOrderData = {
        ...orderData,
        n_document: userInfo.n_document
    };

    console.log(">>> handleSubmit - Submitting Order Data:", finalOrderData);
    try {
        // Dispatch createOrder action
        await dispatch(createOrder(finalOrderData));
        console.log(">>> handleSubmit - createOrder action dispatched.");
        // The useEffect listening to orderCreate.success will handle Wompi opening
    } catch (error) {
        // Catch unexpected errors during dispatch (though handled in action usually)
        console.error(">>> handleSubmit - Error dispatching createOrder:", error);
        Swal.fire("Error", "Ocurrió un problema al intentar crear la orden.", "error");
    }
  };

  // Render the component
  console.log(">>> Checkout Component Render - Rendering JSX...");
  return (
    <>
      <Navbar/>
      <div
        className="min-h-screen flex justify-center items-center bg-cover bg-center px-4"
        style={{ backgroundImage: `url(${imgFondo})`, paddingTop: '4rem' }}
      >
        <div className="max-w-lg w-full mx-auto p-10 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold font-nunito mb-4 text-center">
            Finalizar Compra
          </h2>

          {/* Loading indicator while creating order */}
          {orderCreate.loading && <p className='text-center text-blue-500 font-semibold'>Procesando orden...</p>}

          <form onSubmit={handleSubmit}>
            {/* Date Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold font-nunito text-gray-700">Fecha</label>
              <input
                type="date"
                name="date"
                value={orderData.date}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
                required
                readOnly // Date is usually not user-editable
              />
            </div>

            {/* Shipping Type Display */}
            <div className="mb-4">
              <label className="block text-sm font-semibold font-nunito text-gray-700">
                Tipo de entrega:
              </label>
              <input
                type="text"
                value={orderData.address} // Display the selected/default shipping type
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            {/* Conditional Delivery Address Input */}
            {orderData.address === "Envio a domicilio" && (
              <div className="mb-4">
                <label className="block text-sm font-nunito font-semibold text-gray-700">
                  Dirección de envío:
                </label>
                <input
                  id="deliveryAddress"
                  type="text"
                  value={orderData.deliveryAddress || ''} // Controlled input
                  onChange={handleDeliveryAddressChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  placeholder="Ingresa calle, número, ciudad, etc."
                />
              </div>
            )}

            {/* Order Summary */}
            <div className="mb-4 border-t pt-4">
              <h3 className="text-xl font-semibold font-nunito mb-2">
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
              disabled={orderCreate.loading || orderCreate.success || cart.items.length === 0} // Disable if loading, already succeeded, or cart is empty
            >
              {orderCreate.loading ? "Procesando..." : (orderCreate.success ? "Orden Creada" : "Proceder al Pago")}
            </button>

            {/* Display Order Creation Error */}
            {orderCreate.error && !orderCreate.loading && (
              <div className="text-red-500 mt-2 text-center font-semibold">{orderCreate.error}</div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

// PropTypes for props passed via navigation state (optional but good practice)
Checkout.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      shippingType: PropTypes.string,
      deliveryAddress: PropTypes.string,
    }),
  }),
};

export default Checkout;


