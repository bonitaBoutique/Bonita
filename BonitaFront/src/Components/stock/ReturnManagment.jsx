import React, { useState, useEffect, useMemo, useCallback, useReducer, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  searchReceiptForReturn,
  processReturn,
  clearReturnState,
  fetchAllReceipts,
  fetchProducts,
} from "../../Redux/Actions/actions";
import Swal from "sweetalert2";
import Navbar2 from "../Navbar2";

// ✅ MEJORA 1: Utilidad para fecha de Colombia
const getColombiaDate = () => {
  return new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
};

// ✅ MEJORA 2: Reducer para manejo de estado complejo
const returnDataReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_RETURNED_PRODUCT':
      const existingIndex = state.returned_products.findIndex(
        item => item.id_product === action.payload.product.id_product
      );
      
      if (existingIndex >= 0) {
        const updatedProducts = [...state.returned_products];
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          quantity: action.payload.quantity,
          reason: action.payload.reason
        };
        return { ...state, returned_products: updatedProducts };
      } else {
        return {
          ...state,
          returned_products: [...state.returned_products, action.payload.newProduct]
        };
      }
    
    case 'REMOVE_RETURNED_PRODUCT':
      return {
        ...state,
        returned_products: state.returned_products.filter(
          item => item.id_product !== action.payload.productId
        )
      };

    case 'ADD_NEW_PRODUCTS':
      return {
        ...state,
        new_products: [...state.new_products, ...action.payload.products]
      };

    case 'UPDATE_NEW_PRODUCT_QUANTITY':
      return {
        ...state,
        new_products: state.new_products.map(item =>
          item.id_product === action.payload.id_product
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'REMOVE_NEW_PRODUCT':
      return {
        ...state,
        new_products: state.new_products.filter(
          item => item.id_product !== action.payload.productId
        )
      };
    
    case 'SET_PAYMENT_METHOD':
      return { ...state, customer_payment_method: action.payload.method };

    case 'SET_REASON':
      return { ...state, reason: action.payload.reason };
    
    case 'RESET_RETURN_DATA':
      return {
        returned_products: [],
        new_products: [],
        reason: "",
        customer_payment_method: "Credito en tienda"
      };
    
    default:
      return state;
  }
};

// ✅ MEJORA 3: Componente de fila de producto extraído
const ProductReturnRow = memo(({ 
  product, 
  originalQuantity, 
  onAddProduct, 
  isSelected, 
  selectedProduct, 
  onRemoveProduct 
}) => {
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }

    try {
      const qtyElement = document.getElementById(`qty-${product.id_product}`);
      const reasonElement = document.getElementById(`reason-${product.id_product}`);
      
      const qty = parseInt(qtyElement?.value) || 1;
      const reason = reasonElement?.value;
      
      if (!reason) {
        Swal.fire({
          icon: "warning",
          title: "Motivo requerido",
          text: "Selecciona un motivo para la devolución",
          timer: 2000,
        });
        return;
      }
      
      onAddProduct(product, qty, reason);
      
      Swal.fire({
        icon: "success",
        title: "✅ Producto agregado",
        text: `${product.description} agregado para devolución`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("💥 ERROR en ProductReturnRow:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al agregar el producto",
      });
    }
  }, [product, onAddProduct]);

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${
      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-1">
            {product.description}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center space-x-4">
              <span>ID: <strong>{product.id_product}</strong></span>
              <span>Marca: <strong>{product.marca}</strong></span>
              <span>Talla: <strong>{product.sizes}</strong></span>
              <span>Color: <strong>{product.colors}</strong></span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Precio: <strong>${product.priceSell?.toLocaleString("es-CO")}</strong></span>
              <span>Cantidad comprada: <strong>{originalQuantity}</strong></span>
              <span>Total: <strong>${(product.priceSell * originalQuantity)?.toLocaleString("es-CO")}</strong></span>
            </div>
          </div>
        </div>

        {!isSelected ? (
          <div className="flex items-center space-x-3 ml-4">
            <div className="flex flex-col items-center space-y-2">
              <label className="text-xs text-gray-600">Cantidad a devolver:</label>
              <input
                type="number"
                min="1"
                max={originalQuantity}
                defaultValue="1"
                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                id={`qty-${product.id_product}`}
              />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <label className="text-xs text-gray-600">Motivo:</label>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                id={`reason-${product.id_product}`}
              >
                <option value="">Seleccionar...</option>
                <option value="Defectuoso">Defectuoso</option>
                <option value="Talla incorrecta">Talla incorrecta</option>
                <option value="No le gustó">No le gustó</option>
                <option value="Color diferente">Color diferente</option>
                <option value="Cambio de opinión">Cambio de opinión</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex items-center space-x-1"
            >
              <span>➕</span>
              <span>Devolver</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 ml-4">
            <div className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded">
              <div><strong>Cantidad:</strong> {selectedProduct.quantity}</div>
              <div><strong>Motivo:</strong> {selectedProduct.reason}</div>
              <div><strong>Subtotal:</strong> ${(selectedProduct.unit_price * selectedProduct.quantity).toLocaleString("es-CO")}</div>
            </div>
            <button
              onClick={() => onRemoveProduct(product.id_product)}
              className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors flex items-center space-x-1"
            >
              <span>❌</span>
              <span>Quitar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// ✅ MEJORA 4: Componente SummaryRow extraído
const SummaryRow = memo(({ label, amount, className, amountClassName }) => (
  <div className={`flex justify-between items-center p-2 rounded ${className}`}>
    <span>{label}:</span>
    <span className={`font-bold ${amountClassName}`}>
      ${amount.toLocaleString("es-CO")}
    </span>
  </div>
));

// ✅ MEJORA 5: Error Boundary
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error) => {
      console.error('🚨 Error capturado:', error);
      setHasError(true);
      Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: 'Ha ocurrido un error. Por favor, recarga la página.'
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            🚨 Error en la aplicación
          </h2>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            🔄 Recargar página
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const ReturnManagement = () => {
  console.log("🎨 RENDER - ReturnManagement iniciando");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // ✅ MEJORA 6: SweetAlert optimizado
  const showSwal = useCallback((options) => {
    return Swal.fire({
      ...options,
      imageUrl: undefined,
      iconHtml: undefined,
      backdrop: true,
      allowOutsideClick: true,
      customClass: {
        popup: "custom-swal-popup",
      },
    });
  }, []);

  // ✅ SELECTORES OPTIMIZADOS
  const products = useSelector((state) => state.products || []);
  const productsLoading = useSelector((state) => state.loading);
  const { receipts, receiptsLoading, receiptsError, receiptsPagination } = useSelector((state) => state);

  // ✅ ESTADOS PRINCIPALES
  const [step, setStep] = useState(1);
  const [originalReceipt, setOriginalReceipt] = useState(null);
  const [receiptId, setReceiptId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cashierDocument, setCashierDocument] = useState("");
  const [returnResult, setReturnResult] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [newProductCodes, setNewProductCodes] = useState("");
  const [showNewProductsSection, setShowNewProductsSection] = useState(false);

  // ✅ MEJORA 7: Usar useReducer para estado complejo
  const [returnData, dispatchReturnData] = useReducer(returnDataReducer, {
    returned_products: [],
    new_products: [],
    reason: "",
    customer_payment_method: "Credito en tienda"
  });

  // ✅ MEJORA 8: Cálculos memoizados con useMemo
  const totals = useMemo(() => {
    const totalReturned = returnData.returned_products.reduce((sum, item) => {
      return sum + (item.unit_price || 0) * (item.quantity || 0);
    }, 0);

    const totalNewPurchase = returnData.new_products.reduce((sum, item) => {
      return sum + (item.unit_price || 0) * (item.quantity || 0);
    }, 0);

    const difference = totalNewPurchase - totalReturned;

    return { totalReturned, totalNewPurchase, difference };
  }, [returnData.returned_products, returnData.new_products]);

  // ✅ LOG DEL ESTADO ACTUAL AL RENDERIZAR
  console.log("📊 ESTADO ACTUAL:", {
    step,
    originalReceiptId: originalReceipt?.id_receipt,
    returnedProducts: returnData.returned_products.length,
    newProducts: returnData.new_products.length,
    availableProducts: availableProducts.length,
    loading,
    receiptsLength: receipts?.length,
    productsLength: products?.length,
    totals
  });

  // ✅ EFFECTS OPTIMIZADOS
  useEffect(() => {
    console.log("🔄 useEffect INICIAL - Componente montado");
    console.log("📦 Products en store:", products?.length);
    console.log("📋 Receipts en store:", receipts?.length);

    if (!receipts || receipts.length === 0) {
      console.log("📋 Cargando receipts desde API...");
      dispatch(fetchAllReceipts());
    } else {
      console.log("📋 Receipts ya disponibles, saltando carga");
    }

    if (!products || products.length === 0) {
      console.log("📦 Cargando products desde API...");
      dispatch(fetchProducts());
    } else {
      console.log("📦 Products ya disponibles, saltando carga");
    }
  }, [dispatch, receipts, products]);

  useEffect(() => {
    console.log("🔄 useEffect products - Products cambió");
    console.log("📦 Nuevos products recibidos:", products?.length);

    if (products && products.length > 0) {
      const available = products.filter((product) => product.stock > 0);
      console.log("📦 Products con stock:", available.length);
      console.log("📦 Products sin stock:", products.length - available.length);
      setAvailableProducts(available);
    }
  }, [products]);

  // ✅ MEJORA 9: Funciones con useCallback para optimización
const searchReceipt = useCallback(async () => {
  console.log("🔍 INICIO searchReceipt");
  console.log("📝 Datos de búsqueda:", {
    receiptId: receiptId.trim(),
    cashierDocument: cashierDocument.trim(),
  });

  // ✅ VALIDACIONES MEJORADAS
  if (!receiptId.trim()) {
    console.log("❌ Error: No hay receiptId");
    showSwal({
      title: "⚠️ Campo requerido",
      text: "Por favor, ingresa el número del recibo",
      icon: "warning",
      confirmButtonText: "Entendido"
    });
    return;
  }

  if (!cashierDocument.trim()) {
    console.log("❌ Error: No hay cashierDocument");
    showSwal({
      title: "⚠️ Campo requerido", 
      text: "Por favor, ingresa tu documento de cajero",
      icon: "warning",
      confirmButtonText: "Entendido"
    });
    return;
  }

  console.log("🔄 Iniciando búsqueda...");
  setLoading(true);

  try {
    // ✅ BUSCAR PRIMERO EN LA API (más confiable)
    console.log("🔍 Buscando recibo en API...");
    
    try {
      const result = await dispatch(searchReceiptForReturn(receiptId.trim()));
      
      if (result && result.success && result.receipt) {
        console.log("✅ Recibo encontrado en API:", result.receipt.id_receipt);
        
        // ✅ VALIDAR ESTRUCTURA DE DATOS
        const apiReceipt = result.receipt;
        
        if (!apiReceipt.products || apiReceipt.products.length === 0) {
          console.log("⚠️ Recibo sin productos");
          showSwal({
            title: "⚠️ Recibo sin productos",
            text: "Este recibo no tiene productos asociados para devolver",
            icon: "warning",
            confirmButtonText: "Entendido"
          });
          return;
        }

        // ✅ VERIFICAR ANTIGÜEDAD DEL RECIBO
        const receiptDate = new Date(apiReceipt.date);
        const currentDate = new Date();
        const daysSinceReceipt = Math.floor(
          (currentDate - receiptDate) / (1000 * 60 * 60 * 24)
        );

        console.log("📅 Días desde la compra:", daysSinceReceipt);

        if (daysSinceReceipt > 30) {
          console.log("⚠️ Recibo antiguo, solicitando confirmación...");
          const confirmResult = await showSwal({
            title: "⚠️ Recibo Antiguo",
            html: `
              <div class="text-left space-y-3">
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p class="font-medium text-yellow-800">⏰ Antigüedad del recibo</p>
                  <p class="text-yellow-700">Este recibo tiene <strong>${daysSinceReceipt} días</strong> de antigüedad.</p>
                </div>
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p class="font-medium text-blue-800">📋 Política de devoluciones</p>
                  <p class="text-blue-700">El período estándar es de <strong>30 días</strong>.</p>
                </div>
                <div class="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                  <p class="font-medium text-orange-800">❓ ¿Continuar?</p>
                  <p class="text-orange-700">¿Deseas proceder con esta devolución excepcional?</p>
                </div>
              </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "✅ Sí, continuar",
            cancelButtonText: "❌ Cancelar",
            confirmButtonColor: "#f59e0b",
            cancelButtonColor: "#6b7280",
            focusCancel: true
          });

          if (!confirmResult.isConfirmed) {
            console.log("❌ Usuario canceló devolución de recibo antiguo");
            return;
          }
          console.log("✅ Usuario confirmó devolución de recibo antiguo");
        }

        // ✅ TRANSFORMAR DATOS PARA CONSISTENCIA
        const transformedReceipt = {
          ...apiReceipt,
          // Asegurar que tenga la estructura correcta
          products: apiReceipt.products.map(item => ({
            product: item.product,
            quantity: item.quantity || 1,
            unit_price: item.unit_price || item.product.priceSell
          }))
        };

        console.log("✅ Configurando recibo y avanzando al paso 2");
        setOriginalReceipt(transformedReceipt);
        setStep(2);

        showSwal({
          title: "✅ Recibo Encontrado",
          html: `
            <div class="text-left">
              <p><strong>Recibo:</strong> ${apiReceipt.id_receipt}</p>
              <p><strong>Cliente:</strong> ${apiReceipt.buyer_name || "No especificado"}</p>
              <p><strong>Total:</strong> $${apiReceipt.totalAmount?.toLocaleString("es-CO")}</p>
              <p><strong>Productos:</strong> ${apiReceipt.products.length}</p>
            </div>
          `,
          icon: "success",
          timer: 3000,
          showConfirmButton: false
        });

        return; // ✅ Salir si se encontró en API
      }
    } catch (apiError) {
      console.log("🔍 No encontrado en API, buscando localmente...", apiError.message);
    }

    // ✅ FALLBACK: BUSCAR EN RECEIPTS LOCALES
    console.log("🔍 Buscando en receipts locales...");
    const localReceipt = receipts?.find(
      (receipt) => receipt.id_receipt.toString() === receiptId.trim()
    );

    if (localReceipt) {
      console.log("✅ Recibo encontrado localmente:", localReceipt.id_receipt);

      // ✅ VERIFICAR ESTRUCTURA LOCAL
      if (!localReceipt.OrderDetail?.products || localReceipt.OrderDetail.products.length === 0) {
        console.log("⚠️ Recibo local sin productos");
        showSwal({
          title: "⚠️ Recibo incompleto",
          text: "Este recibo no tiene información completa de productos. Intenta buscar por API.",
          icon: "warning",
          confirmButtonText: "Entendido"
        });
        return;
      }

      // ✅ TRANSFORMAR RECIBO LOCAL A FORMATO CONSISTENTE
      const transformedLocalReceipt = {
        id_receipt: localReceipt.id_receipt,
        cashier_document: localReceipt.cashier_document,
        buyer_name: localReceipt.buyer_name,
        buyer_email: localReceipt.buyer_email,
        buyer_phone: localReceipt.buyer_phone,
        totalAmount: localReceipt.total_amount,
        paymentMethod: localReceipt.payMethod,
        date: localReceipt.date,
        products: localReceipt.OrderDetail.products.map(product => ({
          product: {
            id_product: product.id_product,
            description: product.description,
            priceSell: product.priceSell,
            stock: product.stock,
            marca: product.marca,
            codigoBarra: product.codigoBarra,
            sizes: product.sizes,
            colors: product.colors
          },
          quantity: product.OrderProduct?.quantity || 1,
          unit_price: product.priceSell
        }))
      };

      // ✅ VERIFICAR ANTIGÜEDAD
      const daysSinceReceipt = Math.floor(
        (new Date() - new Date(localReceipt.date)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceReceipt > 30) {
        const confirmResult = await showSwal({
          title: "⚠️ Recibo Antiguo",
          text: `Este recibo tiene ${daysSinceReceipt} días. ¿Continuar?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "✅ Continuar",
          cancelButtonText: "❌ Cancelar"
        });

        if (!confirmResult.isConfirmed) {
          console.log("❌ Usuario canceló devolución de recibo antiguo");
          return;
        }
      }

      setOriginalReceipt(transformedLocalReceipt);
      setStep(2);

      showSwal({
        title: "✅ Recibo Encontrado (Local)",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

    } else {
      // ✅ NO ENCONTRADO EN NINGÚN LADO
      console.log("❌ Recibo no encontrado en ningún lado");
      showSwal({
        title: "❌ Recibo No Encontrado",
        html: `
          <div class="text-left">
            <p>No se pudo encontrar el recibo <strong>${receiptId.trim()}</strong></p>
            <br>
            <p class="text-sm text-gray-600">Verifica que:</p>
            <ul class="text-sm text-gray-600 list-disc list-inside mt-2">
              <li>El número de recibo sea correcto</li>
              <li>El recibo no haya sido eliminado</li>
              <li>Tengas conexión a internet</li>
            </ul>
          </div>
        `,
        icon: "error",
        confirmButtonText: "Intentar de nuevo"
      });
    }

  } catch (error) {
    console.error("💥 Error general en búsqueda:", error);
    showSwal({
      title: "💥 Error de Sistema",
      html: `
        <div class="text-left">
          <p>Ocurrió un error al buscar el recibo.</p>
          <br>
          <details class="text-sm">
            <summary>Detalles técnicos</summary>
            <p class="mt-2 text-gray-600">${error.message}</p>
          </details>
        </div>
      `,
      icon: "error",
      confirmButtonText: "Reintentar"
    });
  } finally {
    console.log("🏁 Finalizando búsqueda, loading = false");
    setLoading(false);
  }
}, [receiptId, cashierDocument, receipts, dispatch, showSwal]);

  const addReturnedProduct = useCallback((product, quantity, reason = "") => {
    console.log("🚀 INICIO addReturnedProduct");
    console.log("📦 Parámetros recibidos:", { product: product.id_product, quantity, reason });

    try {
      const newProduct = {
        id_product: product.id_product,
        quantity: quantity,
        reason: reason,
        product_name: product.description,
        unit_price: product.priceSell,
        marca: product.marca,
        sizes: product.sizes,
        colors: product.colors,
        current_stock: product.stock,
      };

      dispatchReturnData({
        type: 'ADD_RETURNED_PRODUCT',
        payload: { product, quantity, reason, newProduct }
      });

      console.log("✅ Producto agregado exitosamente para devolución");
    } catch (error) {
      console.error("💥 ERROR en addReturnedProduct:", error);
      showSwal({
        icon: "error",
        title: "Error",
        text: "Error al agregar el producto para devolución",
      });
    }
  }, [showSwal]);

  const removeReturnedProduct = useCallback((productId) => {
    console.log("🗑️ INICIO removeReturnedProduct:", productId);
    dispatchReturnData({
      type: 'REMOVE_RETURNED_PRODUCT',
      payload: { productId }
    });
  }, []);

  const handleAddNewProducts = useCallback(() => {
    console.log("🚀 INICIO handleAddNewProducts");
    console.log("📝 newProductCodes:", newProductCodes);

    if (!newProductCodes.trim()) {
      showSwal({
        icon: "warning",
        title: "Código requerido",
        text: "Por favor, ingresa al menos un código de producto.",
      });
      return;
    }

    const codes = newProductCodes
      .trim()
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter((code) => code.length > 0);

    console.log("📋 Códigos procesados:", codes);

    if (codes.length === 0) {
      showSwal({
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
      const product = availableProducts.find((p) => p.id_product === id_product);

      if (product) {
        if (product.stock > 0) {
          const existingProduct = returnData.new_products.find(
            (p) => p.id_product === id_product
          );

          if (existingProduct) {
            showSwal({
              icon: "info",
              title: "Producto ya agregado",
              text: `El producto ${id_product} ya está en la lista. Puedes modificar su cantidad.`,
            });
          } else {
            if (product.stock === 1) {
              showSwal({
                icon: "warning",
                title: "¡Último en stock!",
                text: `Solo queda 1 unidad de ${product.description}`,
              });
            }

            const productToAdd = {
              id_product: product.id_product,
              quantity: 1,
              product_name: product.description,
              unit_price: product.priceSell,
              marca: product.marca,
              sizes: product.sizes,
              colors: product.colors,
              stock: product.stock,
            };

            productsToAdd.push(productToAdd);
          }
        } else {
          outOfStockCodes.push(id_product);
        }
      } else {
        notFoundCodes.push(id_product);
      }
    });

    if (notFoundCodes.length > 0) {
      showSwal({
        icon: "error",
        title: "Productos no encontrados",
        text: `No se encontraron: ${notFoundCodes.join(", ")}`,
      });
    }

    if (outOfStockCodes.length > 0) {
      showSwal({
        icon: "error",
        title: "Sin stock",
        text: `Sin stock disponible: ${outOfStockCodes.join(", ")}`,
      });
    }

    if (productsToAdd.length > 0) {
      dispatchReturnData({
        type: 'ADD_NEW_PRODUCTS',
        payload: { products: productsToAdd }
      });

      showSwal({
        icon: "success",
        title: "Productos agregados",
        text: `Se agregaron ${productsToAdd.length} producto(s) exitosamente.`,
        timer: 1500,
        showConfirmButton: false,
      });
    }

    setNewProductCodes("");
  }, [newProductCodes, availableProducts, returnData.new_products, showSwal]);

  const handleNewProductQuantityChange = useCallback((id_product, quantity) => {
    const numQuantity = Number(quantity);

    if (numQuantity < 1) {
      showSwal({
        icon: "warning",
        title: "Cantidad inválida",
        text: "La cantidad debe ser mayor a 0.",
      });
      return;
    }

    const product = returnData.new_products.find((p) => p.id_product === id_product);

    if (product && numQuantity > product.stock) {
      showSwal({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo hay ${product.stock} unidades disponibles.`,
      });
      return;
    }

    dispatchReturnData({
      type: 'UPDATE_NEW_PRODUCT_QUANTITY',
      payload: { id_product, quantity: numQuantity }
    });
  }, [returnData.new_products, showSwal]);

  const removeNewProduct = useCallback((productId) => {
    dispatchReturnData({
      type: 'REMOVE_NEW_PRODUCT',
      payload: { productId }
    });
  }, []);

  const handleCreateGiftCard = useCallback((amount, reason) => {
    console.log("🎁 INICIO handleCreateGiftCard", { amount, reason });

    if (!originalReceipt) {
      showSwal({
        title: "Error",
        text: "No se encontró información del recibo original",
        icon: "error"
      });
      return;
    }

    if (!amount || amount <= 0) {
      showSwal({
        title: "Error",
        text: "Monto inválido para crear GiftCard",
        icon: "error",
      });
      return;
    }

    showSwal({
      title: "🎁 Crear GiftCard para Cliente",
      html: `
        <div class="text-left">
          <p><strong>Cliente:</strong> ${originalReceipt.buyer_name || "No especificado"}</p>
          <p><strong>Email:</strong> ${originalReceipt.buyer_email || "No especificado"}</p>
          <p><strong>Monto a acreditar:</strong> $${amount.toLocaleString("es-CO")}</p>
          <p><strong>Motivo:</strong> ${reason}</p>
          <br>
          <p>¿Deseas ir a crear la GiftCard manualmente?</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✅ Ir a Crear GiftCard",
      cancelButtonText: "❌ Cancelar",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
    }).then((result) => {
      if (result.isConfirmed) {
        const navigationData = {
          clientName: originalReceipt.buyer_name || "",
          clientEmail: originalReceipt.buyer_email || "",
          totalAmount: amount,
          reason: reason,
          originalReceiptId: originalReceipt.id_receipt,
          returnProducts: returnData.returned_products,
        };

        navigate("/accountClient", {
          state: { returnData: navigationData },
        });
      }
    });
  }, [originalReceipt, returnData.returned_products, navigate, showSwal]);

  const handleCreditoEnTienda = useCallback(() => {
    if (returnData.returned_products.length === 0) {
      showSwal({
        title: "Error",
        text: "Selecciona productos para devolver primero",
        icon: "error",
      });
      return;
    }

    const totalToRefund = totals.totalReturned;

    if (totalToRefund <= 0) {
      showSwal({
        title: "Error",
        text: "No hay monto válido para crear GiftCard",
        icon: "error",
      });
      return;
    }

    handleCreateGiftCard(
      totalToRefund,
      `Devolución directa - Recibo #${originalReceipt.id_receipt}`
    );
  }, [returnData.returned_products.length, totals.totalReturned, originalReceipt, handleCreateGiftCard, showSwal]);

  const handleProcessReturnWithDifference = useCallback(async () => {
    console.log("⚙️ INICIO handleProcessReturnWithDifference");

    if (returnData.returned_products.length === 0) {
      showSwal({
        icon: "error",
        title: "Error",
        text: "Selecciona al menos un producto para devolver",
      });
      return;
    }

    // ✅ CASOS QUE REQUIEREN CREAR GIFTCARD
    if (returnData.customer_payment_method === "Credito en tienda") {
      handleCreditoEnTienda();
      return;
    }

    if (returnData.customer_payment_method === "Cambio") {
      if (returnData.new_products.length === 0) {
        showSwal({
          icon: "info",
          title: "Info",
          text: "Para cambio, selecciona los productos nuevos",
        });
        return;
      }

      if (totals.difference < 0) {
        handleCreateGiftCard(
          Math.abs(totals.difference),
          `Saldo a favor por cambio - Recibo #${originalReceipt.id_receipt}`
        );
        return;
      }
    }

    setLoading(true);

    try {
      const requestData = {
        original_receipt_id: originalReceipt.id_receipt,
        returned_products: returnData.returned_products,
        new_products: returnData.new_products,
        cashier_document: cashierDocument,
        reason: returnData.reason,
        customer_payment_method: returnData.customer_payment_method,
        processed_date: getColombiaDate(), // ✅ Usar fecha de Colombia
        totals: {
          totalReturned: totals.totalReturned,
          totalNewPurchase: totals.totalNewPurchase,
          difference: totals.difference,
        },
      };

      console.log("📤 Enviando datos al backend:", requestData);

      const result = await dispatch(processReturn(requestData));
      console.log("📥 Respuesta del backend:", result);

      if (result.success) {
        console.log("✅ Devolución procesada exitosamente");

        // Actualizar productos devueltos (aumentar stock)
        returnData.returned_products.forEach((returnedProduct) => {
          dispatch({
            type: "UPDATE_PRODUCT_STOCK",
            payload: {
              id_product: returnedProduct.id_product,
              stock_change: +returnedProduct.quantity,
              reason: "RETURN",
            },
          });
        });

        // Actualizar productos nuevos (disminuir stock)
        returnData.new_products.forEach((newProduct) => {
          dispatch({
            type: "UPDATE_PRODUCT_STOCK",
            payload: {
              id_product: newProduct.id_product,
              stock_change: -newProduct.quantity,
              reason: "EXCHANGE",
            },
          });
        });

        await dispatch(fetchProducts());

        setReturnResult(result);
        setStep(4);

        if (totals.difference > 0) {
          showSwal({
            title: "✅ Devolución Procesada",
            html: `
              <div class="text-left">
                <p>✅ Stock actualizado correctamente</p>
                <p>💳 Cliente debe pagar diferencia: $${totals.difference.toLocaleString("es-CO")}</p>
                <p>📄 Generar recibo por la diferencia</p>
              </div>
            `,
            icon: "success",
            timer: 3000,
          });
        } else if (totals.difference === 0) {
          showSwal({
            title: "✅ Devolución Procesada",
            text: "Intercambio exacto - Stock actualizado correctamente",
            icon: "success",
            timer: 2000,
          });
        }
      }
    } catch (error) {
      console.error("💥 ERROR procesando devolución:", error);
      showSwal({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Error al procesar la devolución",
      });
    } finally {
      setLoading(false);
    }
  }, [
    returnData,
    totals,
    originalReceipt,
    cashierDocument,
    handleCreditoEnTienda,
    handleCreateGiftCard,
    dispatch,
    showSwal
  ]);

  // ✅ MEJORA 10: CalculationSummary memoizado y mejorado
  const CalculationSummary = useMemo(() => {
    if (returnData.returned_products.length === 0) return null;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-3 flex items-center">
          <span className="mr-2">🧮</span>
          Resumen de Cálculos
        </h4>

        <div className="space-y-3">
          <SummaryRow
            label="💰 Total a devolver"
            amount={totals.totalReturned}
            className="bg-red-50"
            amountClassName="text-red-600"
          />

          {returnData.customer_payment_method === "Cambio" && returnData.new_products.length > 0 && (
            <>
              <SummaryRow
                label="🛍️ Total productos nuevos"
                amount={totals.totalNewPurchase}
                className="bg-purple-50"
                amountClassName="text-purple-600"
              />

              <div className="border-t pt-2">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded font-bold text-lg">
                  <span>⚖️ Resultado:</span>
                  <span className={`${
                    totals.difference === 0 ? "text-gray-600"
                    : totals.difference > 0 ? "text-red-600"
                    : "text-blue-600"
                  }`}>
                    {totals.difference === 0 ? "✅ Cambio exacto"
                    : totals.difference > 0 ? `💳 Cliente paga: $${totals.difference.toLocaleString("es-CO")}`
                    : `🎁 GiftCard por: $${Math.abs(totals.difference).toLocaleString("es-CO")}`}
                  </span>
                </div>

                {totals.difference < 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreateGiftCard(
                        Math.abs(totals.difference),
                        `Saldo a favor por cambio - Recibo #${originalReceipt.id_receipt}`
                      );
                    }}
                    type="button"
                    className="mt-3 w-full bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    🎁 Crear GiftCard por Saldo a Favor
                  </button>
                )}
              </div>
            </>
          )}

          <div className="border-t pt-2">
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
              <span className="text-yellow-800">📋 Método seleccionado:</span>
              <span className="font-medium text-yellow-700">
                {returnData.customer_payment_method === "Credito en tienda" && "🎁 Crédito en Tienda"}
                {returnData.customer_payment_method === "Cambio" && "🔄 Cambio de productos"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }, [returnData, totals, originalReceipt, handleCreateGiftCard]);

  // ✅ MEJORA 11: ResultStep como componente separado
  const ResultStep = useMemo(() => {
    if (!returnResult) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">
            ¡Devolución Procesada Exitosamente!
          </h3>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-2 text-green-800">
            💵 Reembolso: ${totals.totalReturned.toLocaleString("es-CO")}
          </h4>
          <p>Método: {returnData.customer_payment_method}</p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              setStep(1);
              setOriginalReceipt(null);
              setReceiptId("");
              dispatchReturnData({ type: 'RESET_RETURN_DATA' });
              setCashierDocument("");
              setReturnResult(null);
            }}
            className="bg-blue-500 text-white px-8 py-3 rounded-md hover:bg-blue-600 transition-colors"
          >
            🔄 Nueva Devolución
          </button>

          <button
            onClick={() => navigate("/panel")}
            className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition-colors"
          >
            🏠 Ir al Panel
          </button>
        </div>
      </div>
    );
  }, [returnResult, totals.totalReturned, returnData.customer_payment_method, navigate]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar2 />
        
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* ✅ HEADER CON INDICADOR DE PROGRESO */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🔄 Gestión de Devoluciones
            </h1>
            
            {/* ✅ INDICADOR DE PROGRESO */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    step === stepNumber ? "bg-blue-500" : 
                    step > stepNumber ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    {step > stepNumber ? "✓" : stepNumber}
                  </div>
                  <div className={`ml-3 text-sm font-medium ${
                    step === stepNumber ? "text-blue-600" : 
                    step > stepNumber ? "text-green-600" : "text-gray-500"
                  }`}>
                    {stepNumber === 1 && "Buscar Recibo"}
                    {stepNumber === 2 && "Seleccionar Productos"}
                    {stepNumber === 3 && "Procesar Devolución"}
                    {stepNumber === 4 && "Completado"}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-20 h-1 ml-4 ${
                      step > stepNumber ? "bg-green-500" : "bg-gray-300"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ✅ STEP 1: BUSCAR RECIBO */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <span className="mr-2">🔍</span>
                Buscar Recibo para Devolución
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📋 Número de Recibo
                  </label>
                  <input
                    type="text"
                    value={receiptId}
                    onChange={(e) => setReceiptId(e.target.value)}
                    placeholder="Ej: R-2024-001"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👤 Tu Documento de Cajero
                  </label>
                  <input
                    type="text"
                    value={cashierDocument}
                    onChange={(e) => setCashierDocument(e.target.value)}
                    placeholder="Ej: 12345678"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={searchReceipt}
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Buscar Recibo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ✅ STEP 2: SELECCIONAR PRODUCTOS */}
          {step === 2 && originalReceipt && (
            <div className="space-y-6">
              {/* INFORMACIÓN DEL RECIBO */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Información del Recibo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID Recibo:</span> {originalReceipt.id_receipt}
                  </div>
                  <div>
                    <span className="font-medium">Cliente:</span> {originalReceipt.buyer_name || "No especificado"}
                  </div>
                  <div>
                    <span className="font-medium">Fecha:</span> {new Date(originalReceipt.date).toLocaleDateString("es-CO")}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> ${originalReceipt.totalAmount?.toLocaleString("es-CO")}
                  </div>
                  <div>
                    <span className="font-medium">Método de Pago:</span> {originalReceipt.paymentMethod}
                  </div>
                </div>
              </div>

              {/* PRODUCTOS COMPRADOS */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">🛍️</span>
                  Productos Comprados
                </h3>
                
                <div className="space-y-4">
                  {originalReceipt.products?.map((productWithQuantity) => {
                    const selectedProduct = returnData.returned_products.find(
                      item => item.id_product === productWithQuantity.product.id_product
                    );
                    
                    return (
                      <ProductReturnRow
                        key={productWithQuantity.product.id_product}
                        product={productWithQuantity.product}
                        originalQuantity={productWithQuantity.quantity}
                        onAddProduct={addReturnedProduct}
                        isSelected={!!selectedProduct}
                        selectedProduct={selectedProduct}
                        onRemoveProduct={removeReturnedProduct}
                      />
                    );
                  })}
                </div>
              </div>

              {/* MÉTODO DE DEVOLUCIÓN */}
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-medium mb-4 flex items-center">
                  <span className="mr-2">💰</span>
                  Método de Devolución
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Credito en tienda"
                      checked={returnData.customer_payment_method === "Credito en tienda"}
                      onChange={(e) => dispatchReturnData({
                        type: 'SET_PAYMENT_METHOD',
                        payload: { method: e.target.value }
                      })}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">🎁 Crédito en Tienda</div>
                      <div className="text-sm text-gray-500">GiftCard para compras futuras</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cambio"
                      checked={returnData.customer_payment_method === "Cambio"}
                      onChange={(e) => dispatchReturnData({
                        type: 'SET_PAYMENT_METHOD',
                        payload: { method: e.target.value }
                      })}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">🔄 Cambio de Productos</div>
                      <div className="text-sm text-gray-500">Intercambiar por otros productos</div>
                    </div>
                  </label>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                  >
                    ← Volver
                  </button>

                  {returnData.customer_payment_method === "Credito en tienda" && (
                    <button
                      onClick={handleCreditoEnTienda}
                      disabled={returnData.returned_products.length === 0}
                      className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                    >
                      🎁 Crear GiftCard
                    </button>
                  )}

                  {returnData.customer_payment_method === "Cambio" && (
                    <button
                      onClick={() => setStep(3)}
                      disabled={returnData.returned_products.length === 0}
                      className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      Continuar →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ✅ STEP 3: PRODUCTOS NUEVOS Y PROCESAR */}
          {step === 3 && (
            <div className="space-y-6">
              {/* AGREGAR PRODUCTOS NUEVOS */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">🆕</span>
                  Agregar Productos Nuevos
                </h3>

                <div className="flex space-x-4 mb-4">
                  <input
                    type="text"
                    value={newProductCodes}
                    onChange={(e) => setNewProductCodes(e.target.value)}
                    placeholder="Códigos separados por coma (Ej: ABC123, DEF456)"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddNewProducts}
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
                  >
                    ➕ Agregar
                  </button>
                </div>

                {/* PRODUCTOS NUEVOS AGREGADOS */}
                {returnData.new_products.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Productos Seleccionados:</h4>
                    {returnData.new_products.map((product) => (
                      <div key={product.id_product} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{product.product_name}</div>
                            <div className="text-sm text-gray-600">
                              ID: {product.id_product} | Precio: ${product.unit_price?.toLocaleString("es-CO")}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <label className="text-sm">Cantidad:</label>
                              <input
                                type="number"
                                min="1"
                                max={product.stock}
                                value={product.quantity}
                                onChange={(e) => handleNewProductQuantityChange(product.id_product, e.target.value)}
                                className="w-16 border border-gray-300 rounded px-2 py-1 text-center"
                              />
                            </div>
                            
                            <button
                              onClick={() => removeNewProduct(product.id_product)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              ❌ Quitar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RESUMEN DE CÁLCULOS */}
              {CalculationSummary}

              {/* BOTONES DE ACCIÓN */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                  >
                    ← Volver
                  </button>

                  <button
                    onClick={handleProcessReturnWithDifference}
                    disabled={loading || returnData.returned_products.length === 0}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? "Procesando..." : "✅ Procesar Devolución"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ STEP 4: RESULTADO */}
          {step === 4 && ResultStep}

          {/* ✅ LOADING OVERLAY */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-lg">Procesando...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ReturnManagement;