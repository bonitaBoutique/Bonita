import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getColombiaDate, formatDateForDisplay, isValidDate } from "../utils/dateUtils";
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

  // ✅ Estados mejorados con fecha de Colombia
  const [orderDate, setOrderDate] = useState(() => getColombiaDate());
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productCodes, setProductCodes] = useState("");
  const [nDocument, setNDocument] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (searchTerm) {
      dispatch(fetchFilteredProducts(searchTerm));
    } else {
      dispatch(fetchProducts());
    }
  }, [dispatch, searchTerm]);

  // ✅ Depuración mejorada para fechas
  useEffect(() => {
    console.log("Fecha inicial de Colombia:", orderDate);
    console.log("Fecha formateada para mostrar:", formatDateForDisplay(orderDate));
  }, [orderDate]);

  const filteredProducts = products.filter((product) => product.stock > 0);

  // ✅ Limpiar errores cuando se corrigen
  const clearError = (field) => {
    if (formErrors[field]) {
      setFormErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleProductCodesChange = (e) => {
    const codes = e.target.value;
    setProductCodes(codes);
    clearError('products');
  };

  const handleAddProducts = () => {
    if (!productCodes.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Código requerido",
        text: "Por favor, ingresa al menos un código de producto.",
      });
      return;
    }

    const codes = productCodes
      .trim()
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter(code => code.length > 0);

    if (codes.length === 0) {
      Swal.fire({
        icon: "warning", 
        title: "Códigos inválidos",
        text: "Por favor, ingresa códigos válidos separados por coma.",
      });
      return;
    }

    const productsToAdd = [];
    const notFoundCodes = [];
    const outOfStockCodes = [];

    codes.forEach((id_product) => {
      const product = filteredProducts.find((p) => p.id_product === id_product);
      
      if (product) {
        if (product.stock > 0) {
          // Verificar si el producto ya está seleccionado
          const existingProduct = selectedProducts.find(p => p.id_product === id_product);
          
          if (existingProduct) {
            Swal.fire({
              icon: "info",
              title: "Producto ya agregado",
              text: `El producto ${id_product} ya está en la lista. Puedes modificar su cantidad.`,
            });
          } else {
            if (product.stock === 1) {
              Swal.fire({
                icon: "warning",
                title: "¡Último en stock!",
                text: `Solo queda 1 unidad de ${product.description}`,
              });
            }
            productsToAdd.push({ ...product, quantity: 1 });
          }
        } else {
          outOfStockCodes.push(id_product);
        }
      } else {
        notFoundCodes.push(id_product);
      }
    });

    // Mostrar errores si existen
    if (notFoundCodes.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Productos no encontrados",
        text: `No se encontraron los productos: ${notFoundCodes.join(", ")}`,
      });
    }

    if (outOfStockCodes.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Sin stock",
        text: `Sin stock disponible: ${outOfStockCodes.join(", ")}`,
      });
    }

    // Agregar productos válidos
    if (productsToAdd.length > 0) {
      setSelectedProducts((prevSelected) => [
        ...prevSelected,
        ...productsToAdd,
      ]);
      
      Swal.fire({
        icon: "success",
        title: "Productos agregados",
        text: `Se agregaron ${productsToAdd.length} producto(s) exitosamente.`,
        timer: 1500,
        showConfirmButton: false
      });
    }

    setProductCodes("");
  };

  const handleQuantityChange = (id_product, quantity) => {
    const numQuantity = Number(quantity);
    
    if (numQuantity < 1) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad inválida",
        text: "La cantidad debe ser mayor a 0.",
      });
      return;
    }

    const product = filteredProducts.find(p => p.id_product === id_product);
    
    if (product && numQuantity > product.stock) {
      Swal.fire({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo hay ${product.stock} unidades disponibles de ${product.description}.`,
      });
      return;
    }

    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.id_product === id_product 
          ? { ...item, quantity: numQuantity } 
          : item
      )
    );
  };

  const calculateTotals = () => {
    const totalPrice = selectedProducts.reduce(
      (acc, item) => acc + (item.priceSell * item.quantity),
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
    
    Swal.fire({
      icon: "info",
      title: "Producto eliminado",
      text: "El producto ha sido removido del pedido.",
      timer: 1000,
      showConfirmButton: false
    });
  };

  // ✅ Validar fecha cuando cambia
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (!isValidDate(selectedDate)) {
      setFormErrors(prev => ({ ...prev, date: "Fecha inválida" }));
      Swal.fire({
        icon: "error",
        title: "Fecha inválida",
        text: "Por favor selecciona una fecha válida.",
      });
      return;
    }

    // Validar que no sea una fecha muy antigua (más de 30 días atrás)
    const today = new Date(getColombiaDate());
    const selected = new Date(selectedDate);
    const diffDays = Math.floor((today - selected) / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      Swal.fire({
        icon: "warning",
        title: "Fecha muy antigua",
        text: "No se pueden crear órdenes con más de 30 días de antigüedad.",
      });
      return;
    }

    setOrderDate(selectedDate);
    clearError('date');
    console.log("Fecha seleccionada (Colombia):", selectedDate);
    console.log("Fecha formateada:", formatDateForDisplay(selectedDate));
  };

  const handleDocumentChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    setNDocument(value);
    clearError('document');
  };

  // ✅ Validación completa del formulario
  const validateForm = () => {
    const errors = {};

    if (!nDocument.trim()) {
      errors.document = "El número de documento es requerido";
    } else if (nDocument.length < 6) {
      errors.document = "El número de documento debe tener al menos 6 dígitos";
    }

    if (!isValidDate(orderDate)) {
      errors.date = "Selecciona una fecha válida";
    }

    if (selectedProducts.length === 0) {
      errors.products = "Selecciona al menos un producto";
    }

    // Validar cantidades
    const invalidQuantities = selectedProducts.some(product => 
      !product.quantity || product.quantity < 1
    );

    if (invalidQuantities) {
      errors.quantities = "Todas las cantidades deben ser mayores a 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.values(formErrors)[0];
      Swal.fire({
        icon: "error",
        title: "Error en el formulario",
        text: firstError,
      });
      return;
    }

    const { totalPrice, totalQuantity } = calculateTotals();

    if (totalPrice <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error en el total",
        text: "El total de la orden debe ser mayor a $0",
      });
      return;
    }

    const formattedProducts = selectedProducts.map((product) => ({
      id_product: product.id_product,
      quantity: product.quantity || 1,
    }));

    // ✅ Datos con fecha correcta de Colombia
    const orderDataToSend = {
      date: orderDate, // Ya está en formato YYYY-MM-DD de Colombia
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

    console.log("Enviando orden con fecha de Colombia:", orderDataToSend);

    // Mostrar loading
    Swal.fire({
      title: "Creando orden...",
      text: "Por favor espera mientras procesamos tu pedido",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const orderDetail = await dispatch(createOrder(orderDataToSend));
      console.log("Respuesta del backend:", orderDetail);

      if (orderDetail && orderDetail.id_orderDetail) {
        Swal.fire({
          title: "¡Éxito!",
          text: `Orden creada para el ${formatDateForDisplay(orderDate)}`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });

        // Limpiar formulario
        setSelectedProducts([]);
        setProductCodes("");
        setNDocument("");
        setOrderDate(getColombiaDate());
        setFormErrors({});

        navigate(`/receipt/${orderDetail.id_orderDetail}`);
      } else {
        console.error("Estructura de respuesta inválida:", orderDetail);
        Swal.fire({
          title: "Error",
          text: "No se recibió el detalle de la orden correctamente",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error al crear la orden:", error);
      
      if (error.message && error.message.includes("Usuario no registrado")) {
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
      } else if (error.message && error.message.includes("Stock insuficiente")) {
        Swal.fire({
          title: "Stock insuficiente",
          text: "Algunos productos no tienen stock suficiente. Por favor revisa las cantidades.",
          icon: "warning",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo crear la orden. Inténtalo de nuevo.",
          icon: "error",
        });
      }
    }
  };

  // ✅ Estados de carga y error mejorados
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-200">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => dispatch(fetchProducts())}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-200 py-16">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">No hay productos disponibles con stock.</p>
          <button
            onClick={() => dispatch(fetchProducts())}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Actualizar productos
          </button>
        </div>
      </div>
    );
  }

  const { totalPrice, totalQuantity } = calculateTotals();

  return (
    <div className="p-6 pt-20 bg-slate-200 min-h-screen">
      <Navbar2 />
      
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Crear Nueva Orden</h2>

        {/* Información de fecha actual */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <p className="text-sm text-gray-600">
            <strong>Fecha actual de Colombia:</strong> {formatDateForDisplay(getColombiaDate())}
          </p>
        </div>

        {/* Input para los códigos de productos */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-medium mb-4">Agregar Productos</h3>
          <div className="mb-4">
            <input
              type="text"
              value={productCodes}
              onChange={handleProductCodesChange}
              placeholder="Ingresa los códigos de los productos separados por coma (ej: PROD001, PROD002)"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.products 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {formErrors.products && (
              <p className="text-red-500 text-sm mt-1">{formErrors.products}</p>
            )}
            <button
              onClick={handleAddProducts}
              className="mt-3 w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 font-medium"
            >
              Agregar Productos
            </button>
          </div>
        </div>

        {/* Mostrar productos seleccionados */}
        {selectedProducts.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h3 className="text-xl font-medium mb-4">
              Productos Seleccionados ({selectedProducts.length})
            </h3>
            <div className="space-y-4">
              {selectedProducts.map((product) => (
                <div
                  key={product.id_product}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center flex-1">
                    {product.Images && product.Images.length > 0 && (
                      <img
                        src={product.Images[0].url}
                        alt={product.description}
                        className="w-16 h-16 mr-4 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-lg font-semibold">{product.description}</p>
                      <p className="text-sm text-gray-600">Código: {product.id_product}</p>
                      <p className="text-sm text-gray-600">
                        Precio: ${product.priceSell.toLocaleString("es-CO")}
                      </p>
                      <p className="text-sm text-gray-600">Stock: {product.stock} unidades</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={product.quantity || 1}
                        onChange={(e) =>
                          handleQuantityChange(
                            product.id_product,
                            Number(e.target.value)
                          )
                        }
                        className="w-20 p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Subtotal</p>
                      <p className="text-lg font-bold">
                        ${(product.priceSell * (product.quantity || 1)).toLocaleString("es-CO")}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveProduct(product.id_product)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información del cliente y fecha */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-medium mb-4">Información de la Orden</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número de documento */}
            <div>
              <label htmlFor="n_document" className="block text-sm font-medium text-gray-700 mb-2">
                Número de Documento *
              </label>
              <input
                type="text"
                id="n_document"
                value={nDocument}
                onChange={handleDocumentChange}
                placeholder="Ej: 12345678"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  formErrors.document 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {formErrors.document && (
                <p className="text-red-500 text-sm mt-1">{formErrors.document}</p>
              )}
            </div>

            {/* Fecha del pedido */}
            <div>
              <label htmlFor="order_date" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Pedido *
              </label>
              <input
                type="date"
                id="order_date"
                value={orderDate}
                onChange={handleDateChange}
                min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Hasta 30 días atrás
                max={getColombiaDate()} // No fechas futuras
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  formErrors.date 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <p className="text-sm text-gray-600 mt-1">
                Fecha seleccionada: {formatDateForDisplay(orderDate)}
              </p>
              {formErrors.date && (
                <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
              )}
            </div>
          </div>
        </div>

        {/* Resumen de totales */}
        {selectedProducts.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4">Resumen del Pedido</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total de productos:</span>
                <span className="font-bold">{totalQuantity} unidades</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold">${totalPrice.toLocaleString("es-CO")}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total a Pagar:</span>
                  <span className="font-bold text-green-600">
                    ${totalPrice.toLocaleString("es-CO")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón de confirmar */}
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={selectedProducts.length === 0 || !nDocument || !orderDate}
            className={`w-full p-4 text-white rounded-lg font-medium transition duration-300 ${
              selectedProducts.length === 0 || !nDocument || !orderDate
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {selectedProducts.length === 0 
              ? 'Selecciona productos para continuar'
              : `Confirmar Pedido - ${totalPrice.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default Caja;
