import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { fetchProducts } from "../Redux/Actions/actions";
import { BASE_URL } from "../Config";
import Navbar2 from "./Navbar2";

const RedeemGiftCard = () => {
  const { n_document } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Productos desde Redux
  const products = useSelector((state) => state.products || []);
  const loadingProducts = useSelector((state) => state.loading);
  const errorProducts = useSelector((state) => state.error);

  // Estados locales
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productCodes, setProductCodes] = useState("");
  const [clientInfo, setClientInfo] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loadingClient, setLoadingClient] = useState(true);

  // Cargar productos al montar
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Cargar datos del cliente y saldo GiftCard
  useEffect(() => {
    const fetchClientAndBalance = async () => {
      setLoadingClient(true);
      try {
        const clientRes = await axios.get(`${BASE_URL}/user/${n_document}`);
        setClientInfo(clientRes.data.message);
  
        // Consulta el saldo real de la GiftCard por email
        const email = clientRes.data.message.email;
        
        // 🔍 DEBUG: Log para comparar con ActiveGiftCards
        console.log('🔍 [RedeemGiftCard] Consultando saldo para:', {
          documento: n_document,
          email: email,
          endpoint: `${BASE_URL}/giftcard/balance/${encodeURIComponent(email)}`
        });
        
        const balanceRes = await axios.get(`${BASE_URL}/giftcard/balance/${encodeURIComponent(email)}`);
        
        // 🔍 DEBUG: Log del saldo obtenido
        console.log('🔍 [RedeemGiftCard] Respuesta de saldo:', {
          documento: n_document,
          email: email,
          'respuesta completa': balanceRes.data,
          'saldo extraído': balanceRes.data.saldo || 0,
          'timestamp': new Date().toISOString()
        });
        
        setBalance(balanceRes.data.saldo || 0);
      } catch (err) {
        Swal.fire("Error", "No se pudo cargar el cliente o el saldo.", "error");
        navigate("/active-giftcards");
      } finally {
        setLoadingClient(false);
      }
    };
    fetchClientAndBalance();
  }, [n_document, navigate]);

  // Filtrar productos con stock
  const filteredProducts = products.filter((product) => product.stock > 0);

  // Añadir productos por código (como en Caja)
  const handleAddProducts = () => {
    if (!productCodes) {
      Swal.fire("Aviso", "Ingresa al menos un código.", "warning");
      return;
    }
    const codes = productCodes.split(",").map((c) => c.trim().toUpperCase());
    const productsToAdd = [];
    codes.forEach((code) => {
      const product = filteredProducts.find((p) => p.id_product === code || p.codigo_barras === code);
      if (product) {
        if (product.stock > 0) {
          productsToAdd.push({ ...product, quantity: 1 });
        } else {
          Swal.fire("Error", `Sin stock: ${code}`, "error");
        }
      } else {
        Swal.fire("Error", `No encontrado: ${code}`, "error");
      }
    });
    if (productsToAdd.length > 0) {
      setSelectedProducts((prev) => [...prev, ...productsToAdd]);
    }
    setProductCodes("");
  };

  // Cambiar cantidad
  const handleQuantityChange = (id_product, quantity) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.id_product === id_product
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item
      )
    );
  };

  // Eliminar producto
  const handleRemoveProduct = (id_product) => {
    setSelectedProducts((prev) => prev.filter((item) => item.id_product !== id_product));
  };

  // Calcular total
  const totalPrice = selectedProducts.reduce(
    (acc, item) => acc + item.priceSell * item.quantity,
    0
  );
  const remainingBalance = balance - totalPrice;

  // Confirmar canje
  const handleConfirmRedemption = async () => {
    if (selectedProducts.length === 0) {
      Swal.fire("Aviso", "No hay productos para canjear.", "warning");
      return;
    }
    if (totalPrice > balance) {
      Swal.fire("Error", "El total supera el saldo de la GiftCard.", "error");
      return;
    }
    try {
      await axios.post(`${BASE_URL}/caja/redeem/${n_document}`, {
        items: selectedProducts.map((item) => ({
          id_product: item.id_product,
          quantity: item.quantity,
        })),
        totalAmount: totalPrice,
      });
      Swal.fire("Éxito", "Canje realizado correctamente.", "success");
      navigate("/active-giftcards");
    } catch (err) {
      Swal.fire("Error", "No se pudo procesar el canje.", "error");
    }
  };

  if (loadingClient || loadingProducts) return <div>Cargando...</div>;
  if (!clientInfo) return null;

  return (
    <div className="p-6 pt-20 bg-slate-200 min-h-screen rounded-lg shadow-md">
      <Navbar2 />
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Canjear GiftCard</h1>
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Cliente: {clientInfo.first_name} {clientInfo.last_name} ({clientInfo.n_document})
        </h2>
        <p className="text-xl font-bold text-green-600">
          Saldo Disponible: ${balance?.toLocaleString('es-CO') ?? 0}
        </p>
        {/* 🔍 DEBUG: Log del valor mostrado */}
        {(() => {
          console.log('🔍 [RedeemGiftCard] Renderizando saldo:', {
            documento: clientInfo.n_document,
            email: clientInfo.email,
            'balance state': balance,
            'balance tipo': typeof balance,
            'valor formateado': balance?.toLocaleString('es-CO') ?? 0,
            'timestamp': new Date().toISOString()
          });
          return null;
        })()}
      </div>
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Seleccionar Productos</h2>
        <input
          type="text"
          value={productCodes}
          onChange={(e) => setProductCodes(e.target.value)}
          placeholder="Ingresa códigos separados por coma"
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <button
          type="button"
          onClick={handleAddProducts}
          className="mt-2 w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Agregar Productos
        </button>
        {selectedProducts.length > 0 && (
          <div className="mt-4">
            {selectedProducts.map((product) => (
              <div key={product.id_product} className="flex items-center justify-between mb-2">
                <span>{product.description} (Stock: {product.stock})</span>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={product.quantity}
                  onChange={(e) => handleQuantityChange(product.id_product, Number(e.target.value))}
                  className="w-16 p-1 border border-gray-300 rounded text-center"
                />
                <span>${(product.priceSell * product.quantity).toLocaleString('es-CO')}</span>
                <button
                  onClick={() => handleRemoveProduct(product.id_product)}
                  className="ml-2 text-red-500"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Resumen del Canje</h2>
        <div className="mb-4">
          <p>Total Productos: <b>${totalPrice.toLocaleString('es-CO')}</b></p>
          <p className={remainingBalance < 0 ? "text-red-500" : "text-blue-600"}>
            Saldo Restante: ${remainingBalance.toLocaleString('es-CO')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleConfirmRedemption}
          disabled={selectedProducts.length === 0 || remainingBalance < 0}
          className={`w-full py-2 px-4 rounded text-white font-bold ${
            selectedProducts.length === 0 || remainingBalance < 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-700"
          }`}
        >
          Confirmar Canje
        </button>
      </div>
    </div>
  );
};

export default RedeemGiftCard;