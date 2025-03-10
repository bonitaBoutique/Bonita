import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../Config";
import * as CryptoJS from "crypto-js"
import axios from "axios";
import {
  createOrder,
  clearOrderState,
  fetchLatestOrder,
} from "../Redux/Actions/actions";
import Swal from "sweetalert2";
import imgFondo from '../assets/img/BannerPrincipal/banner3.png'
import Navbar from "./Navbar";
import PropTypes from 'prop-types';

const Checkout = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const location = useLocation();
  const { shippingType, deliveryAddress } = location.state || {};
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log("Shipping Type:", shippingType);
  console.log("Delivery Address:", deliveryAddress);

  const address = deliveryAddress || "Bonita por Defecto"; // Use default if deliveryAddress is null/undefined
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const cart = useSelector((state) => state.cart);
  const orderCreate = useSelector((state) => state.order);
  const [latestOrder, setLatestOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [orderData, setOrderData] = useState({
    date: currentDate,
    amount: cart.totalPrice,
    quantity: cart.totalItems,
    state_order: "Pedido Realizado",
    n_document: userInfo ? userInfo.n_document : "",
    // Modificar para incluir la cantidad de cada producto
    products: cart.items.map(item => ({
      id_product: item.id_product,
      quantity: item.quantity,
      description: item.description,
      price: item.priceSell
    })),
    address: shippingType,
    deliveryAddress: address
  });

  // Manejar creación de orden exitosa
  useEffect(() => {
    const fetchLatestOrder = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/order?latest=true`);
        if (!response.data?.message?.orders?.length) {
          throw new Error('No se encontró la orden');
        }
        setLatestOrder(response.data.message.orders[0]);
      } catch (error) {
        console.error('Error fetching latest order:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLatestOrder();
  }, []);
  
  useEffect(() => {
    console.log('Latest Order:', latestOrder);
  }, [latestOrder]);

  const generateIntegritySignature = (reference, amountInCents, currency, integritySecret, expirationTime) => {
    const data = expirationTime
      ? `${reference}${amountInCents}${currency}${expirationTime}${integritySecret}`
      : `${reference}${amountInCents}${currency}${integritySecret}`;
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  };

  useEffect(() => {
    if (latestOrder && !loading && !error) {
      const { amount, id_orderDetail } = latestOrder;
      const amountInCents = amount * 100;
      const currency = "COP";
      const integritySecret = "prod_integrity_LpUoK811LHCRNykBpQQp67JwmjESi7OD"; // Replace with your actual integrity secret
      const expirationTime = null;

      const integritySignature = generateIntegritySignature(id_orderDetail, amountInCents, currency, integritySecret, expirationTime);

      const widgetData = {
        currency,
        amountInCents,
        reference: String(id_orderDetail),
        publicKey: "pub_prod_pbz8e9I6apsTsgdJHUfp05FQ6jf3vVDB",
        redirectUrl: `https://bonita-seven.vercel.app/eventos/respuesta?id=${id_orderDetail}`, // Updated redirect URL
        integritySignature,
      };
      console.log('Widget Data:', widgetData); 

      const checkout = new WidgetCheckout(widgetData);
      checkout.open((result) => {
        const transaction = result.transaction;
        if (transaction.status === "APPROVED") {
          Swal.fire("Success", "Payment successful", "success");
        } else {
          Swal.fire("Error", "Payment failed", "error");
        }
      });
    }
  }, [latestOrder, loading, error]);
  

  // Actualizar datos de la orden cuando cambian los artículos del carrito
  useEffect(() => {
    setOrderData((prevData) => ({
      ...prevData,
      products: cart.items.map(item => ({
        id_product: item.id_product,
        quantity: item.quantity,
        description: item.description,
        price: item.priceSell
      })),
      amount: cart.totalPrice,
      quantity: cart.totalItems,
    }));
  }, [cart]);

  // Actualizar dirección de entrega
  useEffect(() => {
    setOrderData(prev => ({
      ...prev,
      address: shippingType
    }));
  }, [shippingType]);

 

  // const handleDeliveryAddressChange = (e) => {
  //   const address = e.target.value;
  //   setDeliveryAddress(address);
  //   setOrderData(prev => ({
  //     ...prev,
  //     deliveryAddress: address
  //   }));
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar dirección de entrega si es necesario
    if (address === "Envio a domicilio" && !deliveryAddress) {
      Swal.fire("Error", "Por favor ingresa la dirección de envío", "error");
      return;
    }
    dispatch(createOrder(orderData));
  };

  return (
    
    <>
   <Navbar/>
   {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    <div 
    className="min-h-screen flex justify-center items-center bg-cover bg-center px-4" 
    style={{ backgroundImage: `url(${imgFondo})`, paddingTop: '4rem' }}  // Ajustar el padding si el navbar es fijo
  >
    <div className="max-w-lg w-full mx-auto p-10 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold font-nunito mb-4 text-center">
        Finalizar Compra
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold font-nunito text-gray-700">Fecha</label>
          <input
            type="date"
            name="date"
            value={orderData.date}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold font-nunito text-gray-700">
            Tipo de entrega:
          </label>
          <select
            id="address"
            value={address}
            onChange={address}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="Retira en local">Retira en local</option>
            <option value="Envio a domicilio">Envio a domicilio</option>
          </select>
        </div>
        {address === "Envio a domicilio" && (
          <div className="mb-4">
            <label className="block text-sm font-nunito font-semibold text-gray-700">
              Dirección de envío:
            </label>
            <input
              id="deliveryAddress"
              type="text"
              value={deliveryAddress}
              onChange={handleDeliveryAddressChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
        )}
        <div className="mb-4">
          <h3
            className="text-xl font-semibold font-nunito mb-2"
         
          >
            Resumen del Pedido
          </h3>
          <ul className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <li key={item.id_product} className="py-2">
                <div className="flex justify-between uppercase">
                  <span>{item.description}</span>
                  <span>
                    {item.quantity} x ${item.priceSell}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-4 uppercase">
            <span>Cantidad:</span>
            <span>{cart.totalItems}</span>
          </div>
          <div className="flex justify-between mt-2 uppercase">
            <span>Total:</span>
            <span>${cart.totalPrice}</span>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-slate-500 text-white py-2 px-4 rounded-md hover:bg-slate-400"
          disabled={orderCreate.loading}
        >
          {orderCreate.loading ? "Procesando..." : "Finalizar Compra"}
        </button>
        {orderCreate.error && (
          <div className="text-red-500 mt-2">{orderCreate.error}</div>
        )}
      </form>
    </div>
  </div>
  </>
  );
};
Checkout.propTypes = {
  shippingType: PropTypes.string,
};

export default Checkout;


