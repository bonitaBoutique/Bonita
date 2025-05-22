import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  fetchProducts,
  fetchFilteredProducts,
  createOrder,
  updateOrderState,
} from "../Redux/Actions/actions";
import Navbar2 from "./Navbar2";

const Caja = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const products = useSelector((state) => state.products || []);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const searchTerm = useSelector((state) => state.searchTerm);

  const [orderDate, setOrderDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productCodes, setProductCodes] = useState("");
  const [nDocument, setNDocument] = useState("");

  useEffect(() => {
    if (searchTerm) {
      dispatch(fetchFilteredProducts(searchTerm));
    } else {
      dispatch(fetchProducts());
    }
  }, [dispatch, searchTerm]);

  const filteredProducts = products.filter((product) => product.stock > 0);

  const handleProductCodesChange = (e) => {
    const codes = e.target.value;
    setProductCodes(codes);
  };

  const handleAddProducts = () => {
    if (!productCodes) {
      alert("Por favor, ingresa al menos un código de producto.");
      return;
    }
    const codes = productCodes
      .trim()
      .split(",")
      .map((code) => code.trim().toUpperCase());
    const productsToAdd = [];
    codes.forEach((id_product) => {
      const product = filteredProducts.find((p) => p.id_product === id_product);
      if (product) {
        if (product.stock > 0) {
          if (product.stock === 1) {
            Swal.fire("Advertencia", "Último en stock", "warning");
          }
          productsToAdd.push({ ...product, quantity: 1 });
        } else {
          Swal.fire(
            "Error",
            `El producto con código ${id_product} no tiene stock disponible.`,
            "error"
          );
        }
      } else {
        Swal.fire(
          "Error",
          `No se encontró el producto con código ${id_product}.`,
          "error"
        );
      }
    });
    if (productsToAdd.length > 0) {
      setSelectedProducts((prevSelected) => [
        ...prevSelected,
        ...productsToAdd,
      ]);
    }
    setProductCodes("");
  };

  const handleQuantityChange = (id_product, quantity) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.id_product === id_product ? { ...item, quantity: quantity } : item
      )
    );
  };

  const calculateTotals = () => {
    const totalPrice = selectedProducts.reduce(
      (acc, item) => acc + item.priceSell * item.quantity,
      0
    );
    const totalQuantity = selectedProducts.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    return { totalPrice, totalQuantity };
  };

  const handleRemoveProduct = (id_product) => {
    setSelectedProducts((prev) =>
      prev.filter((product) => product.id_product !== id_product)
    );
  };

  // --- CONSOLE LOGS PARA DEPURAR LA FECHA ---
  useEffect(() => {
    console.log("Valor inicial de orderDate:", orderDate);
  }, []);

  const handleDateChange = (e) => {
    setOrderDate(e.target.value);
    console.log("Fecha seleccionada en el input:", e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nDocument) {
      alert("Por favor, ingresa el número de documento.");
      return;
    }

    const { totalPrice, totalQuantity } = calculateTotals();

    const formattedProducts = selectedProducts.map((product) => ({
      id_product: product.id_product,
      quantity: product.quantity || 1,
    }));

    // LOG: Verifica el valor de orderDate antes de enviar
    console.log("Fecha que se enviará en la orden:", orderDate);

    const orderDataToSend = {
      date: orderDate,
      amount: totalPrice,
      quantity: totalQuantity,
      state_order: "Pedido Realizado",
      products: formattedProducts,
      address: "Retira en Local",
      deliveryAddress: null,
      shippingCost: 0,
      n_document: nDocument,
      pointOfSale: "Local",
    };

    // LOG: Verifica el objeto completo que se envía
    console.log("Enviando datos de la orden:", orderDataToSend);

    try {
      const orderDetail = await dispatch(createOrder(orderDataToSend));
      console.log("Respuesta completa del backend:", orderDetail);

      if (orderDetail && orderDetail.id_orderDetail) {
        console.log("Orden creada exitosamente:", orderDetail);
        navigate(`/receipt/${orderDetail.id_orderDetail}`);
      } else {
        console.error("Estructura de respuesta inválida:", orderDetail);
        Swal.fire({
          title: "Error",
          text: "No se recibió el detalle de la orden correctamente",
          icon: "error",
        });
        throw new Error("No se recibió el detalle de la orden correctamente");
      }
    } catch (error) {
      console.error("Error al crear la orden:", error);
      if (error.message.includes("Usuario no registrado")) {
        Swal.fire({
          title: "Usuario no registrado",
          text: "¿Deseas registrarte ahora?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Registrarse",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/register");
          }
        });
      } else {
        Swal.fire(
          "Error",
          "No se pudo crear la orden. Inténtalo de nuevo.",
          "error"
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error: {error}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-colorBeige py-16">
        <p className="text-white text-lg">No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="p-6 pt-20 bg-slate-200 h-screen rounded-lg shadow-md">
      <Navbar2 />
      <h2 className="text-2xl font-semibold mb-6">Seleccionar Productos</h2>

      {/* Input para los códigos de productos */}
      <div className="mb-4">
        <input
          type="text"
          value={productCodes}
          onChange={handleProductCodesChange}
          placeholder="Ingresa los códigos de los productos separados por coma"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <button
          onClick={handleAddProducts}
          className="mt-2 w-full p-2 bg-gray-400 text-white rounded-lg hover:bg-slate-600 transition duration-300"
        >
          Agregar Productos
        </button>
      </div>

      {/* Mostrar productos seleccionados */}
      {selectedProducts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-4">Productos Seleccionados</h3>
          {selectedProducts.map((product) => (
            <div
              key={product.id_product}
              className="flex items-center justify-between mb-4 p-4 bg-gray-100 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                {product.Images && product.Images.length > 0 && (
                  <img
                    src={product.Images[0].url}
                    alt={product.description}
                    className="w-12 h-12 mr-4 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="mr-4 text-lg font-semibold">
                    {product.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    Precio Unitario: ${product.priceSell}
                  </p>
                </div>
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={product.quantity || 1}
                  onChange={(e) =>
                    handleQuantityChange(
                      product.id_product,
                      Number(e.target.value)
                    )
                  }
                  className="w-16 p-2 border border-gray-300 rounded-md text-center"
                />
                <p className="text-sm text-gray-500">
                  Total: ${product.priceSell * (product.quantity || 1)}
                </p>
                <button
                  onClick={() => handleRemoveProduct(product.id_product)}
                  className="mt-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition duration-300"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input para el número de documento */}
      <div className="mb-4">
        <label htmlFor="n_document" className="block text-lg font-medium mb-2">
          Número de Documento
        </label>
        <input
          type="text"
          id="n_document"
          value={nDocument}
          onChange={(e) => setNDocument(e.target.value)}
          placeholder="Ingresa el número de documento"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Subtotal</h3>
        <p>
          Total productos:{" "}
          <span className="font-bold">{calculateTotals().totalQuantity}</span>
        </p>
        <p>
          Subtotal:{" "}
          <span className="font-bold">
            ${calculateTotals().totalPrice.toLocaleString("es-CO")}
          </span>
        </p>
      </div>
      <div className="mb-4">
        <label htmlFor="order_date" className="block text-lg font-medium mb-2">
          Fecha del pedido
        </label>
        <input
          type="date"
          id="order_date"
          value={orderDate}
          onChange={handleDateChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          className="w-full p-3 bg-gray-400 text-white rounded-lg hover:bg-slate-600 transition duration-300"
        >
          Confirmar Pedido
        </button>
      </form>
    </div>
  );
};

export default Caja;
