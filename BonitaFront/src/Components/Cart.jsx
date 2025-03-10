import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { incrementQuantity, removeFromCart, clearCart, decrementQuantity } from '../Redux/Actions/actions';
import { Link, useNavigate } from 'react-router-dom';
import { SlTrash, SlMinus, SlPlus } from "react-icons/sl";
import backgroundImage from '../assets/img/BannerPrincipal/banner3.png';
import Navbar from './Navbar';
import Swal from 'sweetalert2';
import ShippingOptionsPopup from './ShippingOptionsPopup';
import ShippingPopup from './ShippingPopup';

const Cart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  console.log(cart);
  const { userInfo } = useSelector((state) => state.userLogin);
  const navigate = useNavigate();
  
  const [showShippingOptions, setShowShippingOptions] = useState(false);
  const [showShippingPopup, setShowShippingPopup] = useState(false);
  const [shippingType, setShippingType] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(null);
 
  const handleIncrementQuantity = (productId, stock) => {
    const item = cart.items.find((item) => item.id_product === productId);
    if (item.quantity < stock) {
      dispatch(incrementQuantity(productId));
    }
  };

  const handleDecrementQuantity = (productId) => {
    dispatch(decrementQuantity(productId));
  };

  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleCheckout = () => {
    if (!userInfo) {
      Swal.fire({
        title: 'Debes iniciar sesión o registrarte para realizar la compra.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Iniciar sesión',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login'); 
        }
      });
    } else {
      console.log('Continuar con el proceso de compra');
      setShowShippingOptions(true);
    }
  };
  
  const handleShippingSelect = (option) => {
    setShowShippingOptions(false);
    setShippingType(option);
    
    if (option === 'pickup') {
      navigate('/checkout', { 
        state: { 
          shippingType: 'Retira en Local',
          deliveryAddress: "Bonita por Defecto" 
        } 
      });
    } else {
      setShowShippingPopup(true);
    }
  };

  const handleSaveShippingAddress = (address) => {
    setShowShippingPopup(false);
    setDeliveryAddress(address);
    navigate('/checkout', { 
      state: { 
        shippingType: 'Envio a Domicilio',
        deliveryAddress: address 
      } 
    });
  };

  return (
    <>
      <Navbar/>
      <div className="relative min-h-screen bg-gray-800">
        <img
          src={backgroundImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="relative flex flex-col justify-center items-center min-h-screen py-16 px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-100 rounded-lg shadow-lg p-6 lg:p-8 w-full max-w-4xl">
            <h1 className="text-3xl text-gray-600 font-bold font-nunito mb-10 text-center">
              PRODUCTOS SELECCIONADOS
            </h1>
            {cart.items.length === 0 ? (
              <p className="text-center text-gray-700 font-nunito font-semibold">
                Tu carrito está vacío.
              </p>
            ) : (
              <div>
                {cart.items.map((item) => (
                  <div key={item.id_product} className="flex items-center justify-between mb-6 border-b pb-4 bg-gray-300 p-6">
                    <div className="flex items-center space-x-4">
                      <img src={item.Images[0]?.url} alt={item.name} className="w-28 h-28 object-cover rounded-lg" />
                      <div>
                        <h2 className="text-3xl font-semibold font-nunito text-gray-700 uppercase">{item.name}</h2>
                        <p className="font-nunito text-2xl text-gray-600">Talla {item.sizes}</p>
                        <p className="font-nunito font-semibold text-2xl text-gray-600">Precio: ${item.priceSell}</p>
                        <p className="font-nunito text-lg text-pink-500">Stock disponible: {item.stock}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                            onClick={() => handleDecrementQuantity(item.id_product)}
                          >
                            <SlMinus />
                          </button>
                          <span className="text-lg text-gray-700">{item.quantity}</span>
                          <button
                            className={`bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 ${item.quantity >= item.stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handleIncrementQuantity(item.id_product, item.stock)}
                            disabled={item.quantity >= item.stock}
                          >
                            <SlPlus />
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                            onClick={() => handleRemoveFromCart(item.id_product)}
                          >
                            <SlTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-6">
                  <p className="text-lg font-semibold font-nunito text-pink-200 bg-colorBeige p-2 rounded">
                    Total: ${cart.totalPrice}
                  </p>
                </div>
                <div className="mt-8 flex justify-between">
                  <Link to="/products" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 font-nunito font-semibold">
                    Seguir Comprando
                  </Link>
                  <button
                    onClick={handleCheckout}
                    className="px-4 py-2 bg-pink-400 text-white rounded-md"
                  >
                    Proceder al pago
                  </button>
                  {showShippingOptions && (
                    <ShippingOptionsPopup
                      onClose={() => setShowShippingOptions(false)}
                      onSelect={handleShippingSelect}
                    />
                  )}
                  {showShippingPopup && (
                    <ShippingPopup
                      isShippingPopupOpen={showShippingPopup}
                      onClose={() => setShowShippingPopup(false)}
                      onSave={handleSaveShippingAddress}
                      id_orderDetail="ID_NO_DISPONIBLE"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;


