import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  getServerDate, 
  formatDateForDisplay, 
  isValidDate, 
  validateDateNotFuture,
  getDateForInput 
} from "../utils/dateUtils";
import Swal from "sweetalert2";
import {
  fetchProducts,
  fetchFilteredProducts,
  createOrder,
  updateOrderState,
  getServerTime,
  fetchUserByDocument
} from "../Redux/Actions/actions";
import Navbar2 from "./Navbar2";
import ServerTimeSync from "./ServerTimeSync";
// ✅ IMPORTAR EL POPUP DE REGISTRO
import UserRegistrationPopup from "./Taxxa/UserRegistrationPopup";

const Caja = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ SELECTORES CON SERVIDOR TIME Y USER
  const products = useSelector((state) => state.products || []);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const searchTerm = useSelector((state) => state.searchTerm);
  const serverTime = useSelector((state) => state.serverTime);
  const userTaxxa = useSelector((state) => state.userTaxxa);

  // ✅ ESTADOS BÁSICOS
  const [orderDate, setOrderDate] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productCodes, setProductCodes] = useState("");
  const [nDocument, setNDocument] = useState("");
  const [formErrors, setFormErrors] = useState({});
  
  // ✅ ESTADO SIMPLE para tracking de validación
  const [documentValidated, setDocumentValidated] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState(null);
  const [userValidationState, setUserValidationState] = useState({
    isValidating: false,
    userFound: null,
    lastValidatedDocument: null
  });

  // ✅ NUEVO ESTADO PARA EL POPUP DE REGISTRO
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);

  // ✅ FUNCIÓN para validar si userInfo es un usuario válido
  const isValidUserInfo = (userInfo) => {
    return userInfo && 
           typeof userInfo === 'object' && 
           userInfo !== null &&
           userInfo.n_document && 
           userInfo.first_name;
  };

  // ✅ FUNCIÓN para cerrar el popup y actualizar datos
  const handleRegistrationClose = () => {
    setShowRegistrationPopup(false);
    // Opcional: Re-verificar el usuario después del registro
    if (nDocument.length >= 8) {
      setTimeout(() => {
        verifyUserDocument(nDocument);
      }, 1000);
    }
  };

  // ✅ FUNCIÓN para abrir el popup con documento prellenado
  const handleOpenRegistration = (document) => {
    setShowRegistrationPopup(true);
    // El popup puede recibir el documento como prop si lo modificas
  };

  // ✅ EFECTO DE DEBUG
  useEffect(() => {
    console.log("🔍 [Caja] Estado actual completo:", {
      nDocument,
      documentValidated,
      userValidationState,
      userTaxxa: {
        loading: userTaxxa?.loading,
        error: userTaxxa?.error,
        userInfo: isValidUserInfo(userTaxxa?.userInfo) ? 'VALID_USER' : 'INVALID_OR_NULL',
        userInfoRaw: userTaxxa?.userInfo,
        fullState: userTaxxa
      },
      serverTime: serverTime?.current?.date
    });
  }, [nDocument, documentValidated, userValidationState, userTaxxa, serverTime]);

  // ✅ INICIALIZAR FECHA DEL SERVIDOR
  useEffect(() => {
    if (serverTime?.current?.date && !orderDate) {
      const serverDate = serverTime.current.date;
      console.log('🕒 [Caja] Inicializando con fecha del servidor:', serverDate);
      setOrderDate(serverDate);
    }
  }, [serverTime?.current?.date]);

  useEffect(() => {
    if (searchTerm) {
      dispatch(fetchFilteredProducts(searchTerm));
    } else {
      dispatch(fetchProducts());
    }
  }, [dispatch, searchTerm]);

  // ✅ LOGS DE DEBUG
  useEffect(() => {
    console.log("🕒 [Caja] Estado actual:");
    console.log("- Fecha del servidor:", serverTime?.current?.date);
    console.log("- Fecha seleccionada:", orderDate);
    console.log("- Usuario validado:", userTaxxa);
  }, [orderDate, serverTime, userTaxxa]);

  const filteredProducts = products.filter((product) => product.stock > 0);

  // ✅ LIMPIAR ERRORES
  const clearError = (field) => {
    if (formErrors[field]) {
      setFormErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  // ✅ VERIFICAR USUARIO usando fetchUserByDocument
  const verifyUserDocument = async (document) => {
    if (!document || document.length < 8) return;

    console.log('🔍 [Caja] Iniciando verificación de documento:', document);
    
    // ✅ LIMPIAR estado anterior si es un documento diferente
    if (userValidationState.lastValidatedDocument !== document) {
      setUserValidationState({
        isValidating: true,
        userFound: null,
        lastValidatedDocument: document
      });
    }

    try {
      console.log('📤 [Caja] Despachando fetchUserByDocument para:', document);
      
      const result = await dispatch(fetchUserByDocument(document));
      
      console.log('📥 [Caja] Respuesta de fetchUserByDocument:', result);
      console.log('🔍 [Caja] Tipo de respuesta:', typeof result);
      console.log('🔍 [Caja] Es objeto válido?:', isValidUserInfo(result));
      
      setUserValidationState(prev => ({
        ...prev,
        isValidating: false,
      }));

    } catch (error) {
      console.log('❌ [Caja] Error verificando usuario:', error);
      
      setUserValidationState(prev => ({
        ...prev,
        isValidating: false,
      }));
    }
  };

  const handleDocumentChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    setNDocument(value);
    clearError('document');

    // ✅ LIMPIAR timeout anterior
    if (validationTimeout) {
      clearTimeout(validationTimeout);
      setValidationTimeout(null);
    }

    // ✅ LIMPIAR estado de validación cuando cambia el documento
    if (value !== userValidationState.lastValidatedDocument) {
      setUserValidationState({
        isValidating: false,
        userFound: null,
        lastValidatedDocument: null
      });
      setDocumentValidated(false);
    }

    // ✅ VERIFICAR usuario si el documento tiene la longitud mínima
    if (value.length >= 8) {
      console.log('⏱️ [Caja] Programando validación para documento:', value);
      
      const timeoutId = setTimeout(() => {
        console.log('🚀 [Caja] Ejecutando validación para documento:', value);
        setDocumentValidated(true);
        verifyUserDocument(value);
      }, 1000);

      setValidationTimeout(timeoutId);
    } else {
      setDocumentValidated(false);
    }
  };

  // ✅ EFECTO para manejar respuesta de verificación de usuario CON POPUP
  useEffect(() => {
    console.log('🔄 [Caja] Estado de validación cambió:', {
      documentValidated,
      nDocument,
      userValidationState,
      userTaxxa: {
        loading: userTaxxa?.loading,
        error: userTaxxa?.error,
        userInfo: isValidUserInfo(userTaxxa?.userInfo) ? 'VALID_USER' : 'INVALID_OR_NULL',
        userInfoRaw: userTaxxa?.userInfo
      }
    });

    // ✅ SOLO procesar si se completó una validación
    if (documentValidated && nDocument.length >= 8 && userValidationState.lastValidatedDocument === nDocument) {
      
      // ✅ CASO 1: Usuario encontrado - USAR isValidUserInfo
      if (isValidUserInfo(userTaxxa?.userInfo) && !userTaxxa?.loading) {
        console.log('✅ [Caja] Usuario ENCONTRADO:', userTaxxa.userInfo);
        
        Swal.fire({
          icon: "success",
          title: "Usuario registrado",
          html: `
            <div class="text-left">
              <p><strong>Documento:</strong> ${nDocument}</p>
              <p><strong>Nombre:</strong> ${userTaxxa.userInfo.first_name || ''} ${userTaxxa.userInfo.last_name || ''}</p>
              <p><strong>Email:</strong> ${userTaxxa.userInfo.email || 'No disponible'}</p>
              <p><strong>Teléfono:</strong> ${userTaxxa.userInfo.phone || 'No disponible'}</p>
            </div>
          `,
          timer: 3000,
          showConfirmButton: false
        });

        // ✅ ACTUALIZAR estado correctamente
        setUserValidationState(prev => ({
          ...prev,
          userFound: true
        }));

      } 
      // ✅ CASO 2: Usuario NO encontrado - MOSTRAR POPUP EN LUGAR DE SWEETALERT
      else if (!userTaxxa?.loading && (!isValidUserInfo(userTaxxa?.userInfo) || userTaxxa?.error)) {
        console.log('❌ [Caja] Usuario NO ENCONTRADO para documento:', nDocument);
        console.log('📋 [Caja] userInfo recibido:', userTaxxa?.userInfo);
        console.log('📋 [Caja] Es válido?:', isValidUserInfo(userTaxxa?.userInfo));
        
        // ✅ MOSTRAR SWEETALERT CON OPCIÓN DE POPUP
        Swal.fire({
          icon: "warning",
          title: "Usuario no registrado",
          html: `
            <p>El documento <strong>${nDocument}</strong> no pertenece a un usuario registrado.</p>
            <p>¿Qué deseas hacer?</p>
          `,
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: "Registrar usuario",
          denyButtonText: "Continuar sin registro",
          cancelButtonText: "Cambiar documento",
          confirmButtonColor: "#10b981",
          denyButtonColor: "#3b82f6",
          cancelButtonColor: "#6b7280"
        }).then((result) => {
          if (result.isConfirmed) {
            // ✅ ABRIR EL POPUP DE REGISTRO
            setShowRegistrationPopup(true);
          } else if (result.isDenied) {
            // ✅ CONTINUAR SIN REGISTRO (comportamiento anterior)
            console.log('ℹ️ [Caja] Usuario decidió continuar sin registro');
          } else if (result.isDismissed) {
            // ✅ LIMPIAR Y PERMITIR CAMBIAR DOCUMENTO
            setNDocument("");
            setDocumentValidated(false);
            setUserValidationState({
              isValidating: false,
              userFound: null,
              lastValidatedDocument: null
            });
          }
        });

        // ✅ ACTUALIZAR estado
        setUserValidationState(prev => ({
          ...prev,
          userFound: false
        }));
      }
      
      // ✅ RESETEAR flag de validación
      setDocumentValidated(false);
    }
  }, [userTaxxa, documentValidated, nDocument, navigate, userValidationState]);

  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  // ✅ RESTO DE LAS FUNCIONES SIN CAMBIOS
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    console.log('📅 [Caja] Cambiando fecha a:', selectedDate);

    const validation = validateDateNotFuture(selectedDate, serverTime, 'Fecha de orden');
    
    if (!validation.valid) {
      Swal.fire({
        icon: "error",
        title: "Fecha inválida",
        text: validation.message,
      });
      return;
    }

    const today = new Date(getServerDate(serverTime));
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
    console.log('✅ [Caja] Fecha actualizada a:', selectedDate);
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

  // ✅ VALIDACIÓN SIMPLIFICADA DEL FORMULARIO
  const validateForm = () => {
    const errors = {};

    if (!nDocument.trim()) {
      errors.document = "El número de documento es requerido";
    } else if (nDocument.length < 8) {
      errors.document = "El número de documento debe tener al menos 8 dígitos";
    }

    if (!isValidDate(orderDate)) {
      errors.date = "Selecciona una fecha válida";
    } else {
      const validation = validateDateNotFuture(orderDate, serverTime, 'Fecha de orden');
      if (!validation.valid) {
        errors.date = validation.message;
      }
    }

    if (selectedProducts.length === 0) {
      errors.products = "Selecciona al menos un producto";
    }

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

    console.log("📤 [Caja] Enviando orden:", {
      ...orderDataToSend,
      serverDate: serverTime?.current?.date,
      userFound: isValidUserInfo(userTaxxa?.userInfo)
    });

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
      console.log("✅ [Caja] Respuesta del backend:", orderDetail);

      if (orderDetail && orderDetail.id_orderDetail) {
        Swal.fire({
          title: "¡Éxito!",
          text: `Orden creada para el ${formatDateForDisplay(orderDate)}`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });

        setSelectedProducts([]);
        setProductCodes("");
        setNDocument("");
        setOrderDate(getServerDate(serverTime));
        setFormErrors({});
        setDocumentValidated(false);
        setUserValidationState({
          isValidating: false,
          userFound: null,
          lastValidatedDocument: null
        });

        navigate(`/receipt/${orderDetail.id_orderDetail}`);
      } else {
        console.error("❌ [Caja] Estructura de respuesta inválida:", orderDetail);
        Swal.fire({
          title: "Error",
          text: "No se recibió el detalle de la orden correctamente",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("❌ [Caja] Error al crear la orden:", error);
      
      if (error.message && error.message.includes("Stock insuficiente")) {
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

  // ✅ ESTADOS DE CARGA MEJORADOS
  if (loading || serverTime?.loading) {
    return (
      <ServerTimeSync showDebug={false}>
        <div className="min-h-screen flex items-center justify-center bg-slate-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {serverTime?.loading ? 'Sincronizando con servidor...' : 'Cargando productos...'}
            </p>
          </div>
        </div>
      </ServerTimeSync>
    );
  }

  if (error) {
    return (
      <ServerTimeSync showDebug={false}>
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
      </ServerTimeSync>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <ServerTimeSync showDebug={false}>
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
      </ServerTimeSync>
    );
  }

  const { totalPrice, totalQuantity } = calculateTotals();

  const getDocumentInputClass = () => {
    if (formErrors.document) {
      return 'border-red-500 focus:ring-red-500';
    }
    
    if (nDocument.length >= 8) {
      if (userValidationState.isValidating || userTaxxa?.loading) {
        return 'border-blue-500 focus:ring-blue-500';
      } 
      else if (isValidUserInfo(userTaxxa?.userInfo) && !userTaxxa?.error) {
        return 'border-green-500 focus:ring-green-500';
      } 
      else if (userTaxxa?.error || !isValidUserInfo(userTaxxa?.userInfo)) {
        return 'border-orange-500 focus:ring-orange-500';
      }
    }
    
    return 'border-gray-300 focus:ring-blue-500';
  };

  return (
    <ServerTimeSync showDebug={false}>
      <div className="p-6 pt-20 bg-slate-200 min-h-screen">
        <Navbar2 />
        
        {/* ✅ RENDERIZAR EL POPUP DE REGISTRO CONDICIONALMENTE */}
        {showRegistrationPopup && (
          <UserRegistrationPopup 
            onClose={handleRegistrationClose}
            prefilledDocument={nDocument}
          />
        )}
        
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Crear Nueva Orden
          </h2>

          {/* ✅ INFORMACIÓN DE FECHA ACTUAL DEL SERVIDOR */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <p className="text-sm text-gray-600">
              <strong>Fecha actual del servidor:</strong> {formatDateForDisplay(getServerDate(serverTime))}
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

          {/* ✅ INFORMACIÓN DEL CLIENTE Y FECHA CON VALIDACIÓN */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-medium mb-4">Información de la Orden</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ✅ NÚMERO DE DOCUMENTO CON VALIDACIÓN CORREGIDA */}
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
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${getDocumentInputClass()}`}
                />
                        
                {/* ✅ INDICADOR DE CARGA */}
                {nDocument.length >= 8 && (userValidationState.isValidating || userTaxxa?.loading) && (
                  <p className="text-blue-500 text-sm mt-1 flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></span>
                    Verificando usuario {nDocument}...
                  </p>
                )}

                {/* ✅ USUARIO ENCONTRADO - USAR isValidUserInfo */}
                {nDocument.length >= 8 && isValidUserInfo(userTaxxa?.userInfo) && !userTaxxa?.loading && !userTaxxa?.error && (
                  <p className="text-green-600 text-sm mt-1 flex items-center">
                    ✅ Usuario registrado: {userTaxxa.userInfo.first_name} {userTaxxa.userInfo.last_name}
                  </p>
                )}

                {/* ✅ USUARIO NO ENCONTRADO - USAR isValidUserInfo */}
                {nDocument.length >= 8 && !userValidationState.isValidating && !userTaxxa?.loading && !isValidUserInfo(userTaxxa?.userInfo) && (
                  <div className="mt-1">
                    <p className="text-orange-600 text-sm flex items-center">
                      ⚠️ Usuario no registrado
                    </p>
                    <button
                      onClick={() => setShowRegistrationPopup(true)}
                      className="text-blue-600 text-sm hover:text-blue-800 underline mt-1"
                    >
                      📝 Registrar usuario ahora
                    </button>
                  </div>
                )}
                
                {formErrors.document && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.document}</p>
                )}
              </div>

              {/* ✅ FECHA DEL PEDIDO CON SERVIDOR */}
              <div>
                <label htmlFor="order_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Pedido *
                </label>
                <input
                  type="date"
                  id="order_date"
                  value={orderDate}
                  onChange={handleDateChange}
                  min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  max={getDateForInput(serverTime)}
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

          {/* ✅ BOTÓN DE CONFIRMAR CON SINCRONIZACIÓN */}
          <div className="flex gap-4 mb-6">
            <form onSubmit={handleSubmit} className="flex-1">
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
            
            <button
              onClick={() => dispatch(getServerTime())}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition duration-300"
              title="Sincronizar con servidor"
            >
              🕒 Sync
            </button>
          </div>
        </div>
      </div>
    </ServerTimeSync>
  );
};

export default Caja;