import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, fetchLatestReceipt, createReceipt, fetchProducts } from "../Redux/Actions/actions";
import { jsPDF } from "jspdf";
import Navbar2 from "./Navbar2";

const Caja = () => {
  const dispatch = useDispatch();
  const currentDate = new Date().toISOString().split('T')[0];
  // Estado para la Orden
  const [orderData, setOrderData] = useState({
    date: currentDate,
    amount: 0,
    quantity: 1,
    state_order: "Retirado",
    id_product: [],
    address: "",
    pointOfSale:"Local",
    n_document: 0,
  });

  const [receiptData, setReceiptData] = useState({
    id_orderDetail: "",
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    total_amount: 0,
  });

  const [productId, setProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const products = useSelector((state) => state.products);
  const lastReceipt = useSelector((state) => state.lastReceipt);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchLatestReceipt());
  }, [dispatch]);

  useEffect(() => {
    if (lastReceipt) {
      setOrderData((prev) => ({
        ...prev,
        id_receipt: lastReceipt.id_receipt + 1,
      }));
    }
  }, [lastReceipt]);
  

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderData({ ...orderData, [name]: value });
  };

  const handleReceiptChange = (e) => {
    const { name, value } = e.target;
    setReceiptData({ ...receiptData, [name]: value });
  };

  const handleProductIdChange = (e) => {
    const value = e.target.value;
    setProductId(value);
   
    const product = products.find((prod) => prod.id_product === value);
    setSelectedProduct(product || null);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10) || 1;
    setQuantity(value);
    if (selectedProduct) {
      // Actualizar el monto total según la cantidad y el precio del producto
      setOrderData((prev) => ({
        ...prev,
        amount: prev.amount + selectedProduct.priceSell * value,
      }));
    }
  };

  const handleAddProductById = () => {
    if (!productId || !selectedProduct) {
      alert("Por favor ingrese un ID de producto válido.");
      return;
    }
    setOrderData((prev) => ({
      ...prev,
      id_product: [...prev.id_product, selectedProduct.id_product],
    }));

    setProductId("");
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    try {
      const createdOrder = await dispatch(createOrder(orderData));
      if (createdOrder) {
        alert("Orden creada con éxito.");
        setReceiptData((prev) => ({
          ...prev,
          id_orderDetail: createdOrder.id_orderDetail,
          total_amount: createdOrder.amount,
        }));
      }
    } catch (error) {
      console.error("Error creando la orden:", error);
      alert("Error al crear la orden.");
    }
  };

  const handleSubmitReceipt = async (e) => {
    e.preventDefault();
    try {
      const createdReceipt = await dispatch(createReceipt(receiptData));
      if (createdReceipt) {
        alert("Recibo creado con éxito.");
      }
    } catch (error) {
      console.error("Error creando el recibo:", error);
      alert("Error al crear el recibo.");
    }
  };

  
  
    return (
      <>
      <Navbar2/>
    
      <form onSubmit={handleSubmitOrder} className="space-y-6 bg-gray-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-7 gap-6 mt-40">
          {/* Orden de compra */}
          <div className="flex flex-col">
            <label htmlFor="date" className="mb-2">Fecha</label>
            <input
              type="date"
              id="date"
              name="date"
              value={orderData.date}
              onChange={handleOrderChange}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="product" className="mb-2">Producto</label>
            <input
              type="text"
              id="product"
              name="product"
              value={productId}
              onChange={handleProductIdChange}
              className="p-2 border border-gray-300 rounded"
              placeholder="ID del producto"
            />
          </div>
  
          <div className="flex flex-col">
          <label htmlFor="productDescription" className="mb-2">Descripción</label>
          <input
            type="text"
            id="productDescription"
            name="productDescription"
            value={selectedProduct ? selectedProduct.description : ""}
            readOnly
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Precio de Venta */}
        <div className="flex flex-col">
          <label htmlFor="priceSell" className="mb-2">Precio de Venta</label>
          <input
            type="number"
            id="priceSell"
            name="priceSell"
            value={selectedProduct ? selectedProduct.priceSell : ""}
            readOnly
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Cantidad */}
        <div className="flex flex-col">
          <label htmlFor="quantity" className="mb-2">Cantidad</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={quantity}
            onChange={handleQuantityChange}
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Monto Total */}
        <div className="flex flex-col">
          <label htmlFor="amount" className="mb-2">Monto Total</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={orderData.amount}
            readOnly
            className="p-2 border border-gray-300 rounded"
          />
        </div>
     
  
          {/* Estado de la orden */}
          <div className="flex flex-col">
            <label htmlFor="state_order" className="mb-2">Estado de la orden</label>
            <select
              id="state_order"
              name="state_order"
              value={orderData.state_order}
              onChange={handleOrderChange}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="Retirado">Retirado</option>
              <option value="Enviado">Enviado</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
        </div>
  
        <div className="flex justify-center">
          <button type="submit" className="bg-slate-500 text-white p-2 rounded">
            Crear Orden
          </button>
        </div>
      </form>
      </>
    );
  };
  

export default Caja;

 



