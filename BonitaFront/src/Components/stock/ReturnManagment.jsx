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
import { getColombiaDateTime, formatDateForDisplay } from "../../utils/dateUtils";
import { BASE_URL } from "../../Config";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import Navbar2 from "../Navbar2";

// ✅ MEJORA 1: Función optimizada usando utilidades globales
const getColombiaDate = () => {
  return getColombiaDateTime().toLocaleString("es-CO", { timeZone: "America/Bogota" });
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
      const priceElement = document.getElementById(`price-${product.id_product}`);
      const reasonElement = document.getElementById(`reason-${product.id_product}`);
      
      const qty = parseInt(qtyElement?.value) || 1;
      const customPrice = parseFloat(priceElement?.value) || product.priceSell;
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
      
      onAddProduct(product, qty, reason, customPrice);
      
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
              <label className="text-xs text-gray-600">Precio devolución:</label>
              <input
                type="number"
                min="0"
                step="100"
                defaultValue={product.priceSell}
                className="w-28 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                id={`price-${product.id_product}`}
                placeholder="$0"
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
  const { user } = useSelector((state) => state.auth || {});

  // ✅ ESTADOS PRINCIPALES
  const [step, setStep] = useState(1);
  const [originalReceipt, setOriginalReceipt] = useState(null);
  const [receiptId, setReceiptId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cashierDocument, setCashierDocument] = useState(user?.n_document || "");
  const [cashierDocumentValidation, setCashierDocumentValidation] = useState({
    isValid: false,
    message: "",
    isValidating: false
  });
  const [returnResult, setReturnResult] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [newProductCodes, setNewProductCodes] = useState("");
  const [showNewProductsSection, setShowNewProductsSection] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  // ✅ MEJORA 7: Usar useReducer para estado complejo
  const [returnData, dispatchReturnData] = useReducer(returnDataReducer, {
    returned_products: [],
    new_products: [],
    reason: "",
    customer_payment_method: "Credito en tienda"
  });

  // ✅ Manejar cambio del documento del cajero con validación
  const handleCashierDocumentChange = async (value) => {
    setCashierDocument(value);
    
    if (value.trim() === "") {
      setCashierDocumentValidation({
        isValid: false,
        message: "",
        isValidating: false
      });
      return;
    }

    // Mostrar estado de validación
    setCashierDocumentValidation({
      isValid: false,
      message: "Validando documento...",
      isValidating: true
    });

    // Debounce: esperar 500ms antes de validar
    clearTimeout(window.cashierDocumentTimeout);
    window.cashierDocumentTimeout = setTimeout(async () => {
      const validation = await validateCashierDocument(value);
      setCashierDocumentValidation({
        ...validation,
        isValidating: false
      });
    }, 500);
  };

  // ✅ Función para validar documento del cajero
  const validateCashierDocument = async (document) => {
    if (!document || document.trim() === "") {
      return { isValid: false, message: "El documento del cajero es requerido" };
    }

    const cleanDocument = document.trim();

    // Validar formato: solo números y longitud mínima
    if (!/^\d{7,15}$/.test(cleanDocument)) {
      return { 
        isValid: false, 
        message: "El documento debe contener solo números y tener entre 7 y 15 dígitos" 
      };
    }

    // Verificar que el usuario existe en el backend
    try {
      const response = await fetch(`${BASE_URL}/user/validate/${cleanDocument}`);
      const data = await response.json();
      
      if (data.exists) {
        return { 
          isValid: true, 
          message: `✅ Usuario válido: ${data.user.first_name} ${data.user.last_name}`,
          user: data.user 
        };
      } else {
        return { 
          isValid: false, 
          message: "Este documento no está registrado en el sistema" 
        };
      }
    } catch (error) {
      console.warn("No se pudo validar el documento en tiempo real:", error);
      return { 
        isValid: true, 
        message: "Documento aceptado (validación offline)" 
      };
    }
  };

  // ✅ Actualizar documento del cajero cuando cambie el usuario autenticado
  useEffect(() => {
    if (user?.n_document && user.n_document !== cashierDocument) {
      setCashierDocument(user.n_document);
      console.log("👤 Documento del cajero actualizado automáticamente:", user.n_document);
      
      // Validar automáticamente el documento del usuario autenticado
      setCashierDocumentValidation({
        isValid: true,
        message: `✅ Usuario autenticado: ${user.first_name} ${user.last_name}`,
        isValidating: false
      });
    }
  }, [user?.n_document]);

  // ✅ Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (window.cashierDocumentTimeout) {
        clearTimeout(window.cashierDocumentTimeout);
      }
    };
  }, []);

  // ✅ MEJORA 8: Cálculos memoizados con useMemo
  const totals = useMemo(() => {
    const totalReturned = returnData.returned_products.reduce((sum, item) => {
      return sum + (item.unit_price || 0) * (item.quantity || 0);
    }, 0);

    const totalNewPurchase = returnData.new_products.reduce((sum, item) => {
      return sum + (item.unit_price || 0) * (item.quantity || 0);
    }, 0);

    const difference = totalNewPurchase - totalReturned;

    const calculatedTotals = { totalReturned, totalNewPurchase, difference };
    
    console.log("🧮 RECALCULANDO TOTALES:");
    console.log("🧮 Productos devueltos:", returnData.returned_products.length);
    console.log("🧮 Productos nuevos:", returnData.new_products.length);
    console.log("🧮 Total devuelto:", totalReturned);
    console.log("🧮 Total nueva compra:", totalNewPurchase);
    console.log("🧮 Diferencia:", difference);
    console.log("🧮 Detalle productos devueltos:", returnData.returned_products.map(item => ({
      id: item.id_product,
      qty: item.quantity,
      price: item.unit_price,
      subtotal: (item.unit_price || 0) * (item.quantity || 0)
    })));

    return calculatedTotals;
  }, [returnData.returned_products, returnData.new_products]);

  // ✅ FUNCIÓN PARA GENERAR PDF DEL RECIBO DE DIFERENCIA
  const generateDifferenceReceiptPDF = useCallback((receiptData, difference, actionRequired, paymentMethod) => {
    console.log("📄 Generando PDF de recibo de diferencia...");
    console.log("📄 Datos del recibo:", receiptData);
    console.log("📄 Diferencia:", difference);
    console.log("📄 ActionRequired:", actionRequired);
    console.log("📄 Método de pago:", paymentMethod);

    const doc = new jsPDF({
      unit: "pt",
      format: [226.77, 839.28], // Formato de recibo
    });

    // Configurar fuente
    doc.setFontSize(18);
    doc.text("Bonita Boutique", doc.internal.pageSize.width / 2, 30, {
      align: "center",
    });

    doc.setFontSize(10);
    let currentY = 50;

    // Información de la empresa
    doc.text("Bonita Boutique S.A.S NIT:", doc.internal.pageSize.width / 2, currentY, {
      align: "center"
    });
    currentY += 20;

    doc.text("901832769-3", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    doc.text("Cel: 3118318191", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 30;

    // Número de recibo
    doc.text(`RECIBO # ${actionRequired.receiptId || 'N/A'}`, doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    // Fecha
    const today = getColombiaDateTime();
    const dateStr = formatDateForDisplay(today);
    doc.text(`Fecha: ${dateStr}`, doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    doc.setFontSize(12);
    doc.text("DIFERENCIA POR DEVOLUCIÓN", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    // Información del cliente (basado en recibo original)
    doc.setFontSize(10);
    doc.text(`Cliente: ${originalReceipt?.buyer_name || 'N/A'}`, 20, currentY);
    currentY += 20;

    doc.text(`Email: ${originalReceipt?.buyer_email || 'N/A'}`, 20, currentY);
    currentY += 20;

    doc.text(`Teléfono: ${originalReceipt?.buyer_phone || 'N/A'}`, 20, currentY);
    currentY += 20;

    doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    // Detalles de la transacción
    doc.setFontSize(11);
    doc.text("DETALLES DE LA DEVOLUCIÓN:", 20, currentY);
    currentY += 20;

    doc.text(`Recibo original: #${originalReceipt?.id_receipt || 'N/A'}`, 20, currentY);
    currentY += 15;

    doc.text(`Total devuelto: $${totals.totalReturned.toLocaleString("es-CO")}`, 20, currentY);
    currentY += 15;

    if (returnData.new_products.length > 0) {
      doc.text(`Total productos nuevos: $${totals.totalNewPurchase.toLocaleString("es-CO")}`, 20, currentY);
      currentY += 15;
    }

    doc.text(`Diferencia a pagar: $${difference.toLocaleString("es-CO")}`, 20, currentY);
    currentY += 15;

    doc.text(`Método de pago: ${paymentMethod || 'Efectivo'}`, 20, currentY);
    currentY += 20;

    doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    // Productos devueltos
    if (returnData.returned_products.length > 0) {
      doc.setFontSize(9);
      doc.text("PRODUCTOS DEVUELTOS:", 20, currentY);
      currentY += 15;

      returnData.returned_products.forEach((product, index) => {
        const productLine = `${index + 1}. ${product.id_product} - Qty: ${product.quantity} - $${product.unit_price.toLocaleString("es-CO")}`;
        const lines = doc.splitTextToSize(productLine, 170);
        doc.text(lines, 20, currentY);
        currentY += 12 * lines.length;
      });
      currentY += 10;
    }

    // Productos nuevos
    if (returnData.new_products.length > 0) {
      doc.setFontSize(9);
      doc.text("PRODUCTOS NUEVOS:", 20, currentY);
      currentY += 15;

      returnData.new_products.forEach((product, index) => {
        const productLine = `${index + 1}. ${product.id_product} - Qty: ${product.quantity} - $${product.unit_price.toLocaleString("es-CO")}`;
        const lines = doc.splitTextToSize(productLine, 170);
        doc.text(lines, 20, currentY);
        currentY += 12 * lines.length;
      });
      currentY += 10;
    }

    doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    // ✅ SECCIÓN DE IMPUESTOS (IVA 19%)
    doc.setFontSize(10);
    doc.text("DETALLE DE IMPUESTOS:", 20, currentY);
    currentY += 15;

    const baseImponible = difference / 1.19;
    const ivaAmount = difference - baseImponible;

    doc.text(`Base imponible: $${baseImponible.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, currentY);
    currentY += 12;

    doc.text(`IVA (19%): $${ivaAmount.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, currentY);
    currentY += 12;

    doc.text(`Total: $${difference.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, currentY);
    currentY += 20;

    doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    // ✅ Información del cajero (nombre y apellido)
    const cashierName = user?.first_name && user?.last_name 
      ? `${user.first_name} ${user.last_name}`
      : cashierDocument || 'N/A';
    
    doc.setFontSize(10);
    doc.text(`Atendido por: ${cashierName}`, 20, currentY);
    currentY += 15;

    doc.text(`Transacción: Diferencia por devolución`, 20, currentY);
    currentY += 20;

    doc.text("*".repeat(35), doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    // ✅ Servicio al cliente
    doc.setFontSize(9);
    doc.text("Servicio al cliente:", 20, currentY);
    currentY += 12;
    doc.text("311 8318191 - bonitaboutiquecumaral@gmail.com", 20, currentY);
    currentY += 20;

    // ✅ Política de protección de datos
    doc.setFontSize(8);
    const policyText = "Al realizar esta transacción, acepta nuestra política de protección de datos personales disponible en https://bonitaboutique.com/politica-de-datos";
    const policyLines = doc.splitTextToSize(policyText, 186);
    doc.text(policyLines, 20, currentY);
    currentY += 10 * policyLines.length + 10;

    doc.setFontSize(12);
    doc.text("Gracias por elegirnos!", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });

    // Abrir el PDF en una nueva ventana
    doc.output("dataurlnewwindow");
    
    console.log("✅ PDF de recibo de diferencia generado exitosamente");
  }, [originalReceipt, totals, returnData, cashierDocument, user]);

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
    console.log("📦 Primeros 3 productos como muestra:", products?.slice(0, 3)?.map(p => ({
      id: p.id_product,
      name: p.description,
      stock: p.stock,
      price: p.priceSell
    })));

    if (products && products.length > 0) {
      const available = products.filter((product) => product.stock > 0);
      console.log("📦 Products con stock:", available.length);
      console.log("📦 Products sin stock:", products.length - available.length);
      console.log("📦 IDs de productos con stock:", available.map(p => p.id_product).slice(0, 10)); // Primeros 10
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
        
        // ✅ VALIDAR PRODUCTOS DISPONIBLES
        console.log("� Productos disponibles para devolución:", result.receipt.products?.length || 0);
        
        // ✅ VALIDAR ESTRUCTURA DE DATOS
        const apiReceipt = result.receipt;
        
        if (!apiReceipt.products || apiReceipt.products.length === 0) {
          console.log("⚠️ Recibo sin productos disponibles para devolución");
          
          // ✅ MENSAJE MEJORADO: Distinguir entre sin productos y ya procesado
          const hasReturnHistory = apiReceipt.returnHistory && apiReceipt.returnHistory.length > 0;
          const title = hasReturnHistory ? "📋 Recibo ya procesado" : "⚠️ Recibo sin productos";
          const message = hasReturnHistory 
            ? `Este recibo ya ha sido procesado para devoluciones (${apiReceipt.returnHistory.length} devolución(es) registrada(s)). Todos los productos han sido devueltos.`
            : "Este recibo no tiene productos asociados para devolver";
          
          showSwal({
            title,
            text: message,
            icon: hasReturnHistory ? "info" : "warning",
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
              <p><strong>Productos disponibles:</strong> ${apiReceipt.products.length}</p>
              ${apiReceipt.returnHistory && apiReceipt.returnHistory.length > 0 
                ? `<p><strong>⚠️ Devoluciones previas:</strong> ${apiReceipt.returnHistory.length}</p>
                   <small>Solo se muestran productos aún disponibles para devolución</small>`
                : ''
              }
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

  const addReturnedProduct = useCallback((product, quantity, reason = "", customPrice = null) => {
    console.log("🚀 INICIO addReturnedProduct");
    
    const returnPrice = customPrice !== null ? customPrice : product.priceSell;
    
    console.log("📦 Parámetros recibidos:", { 
      product_id: product.id_product,
      product_name: product.description,
      quantity, 
      reason,
      original_price: product.priceSell,
      custom_price: customPrice,
      return_price: returnPrice,
      current_stock: product.stock
    });

    try {
      const newProduct = {
        id_product: product.id_product,
        quantity: quantity,
        reason: reason,
        product_name: product.description,
        unit_price: returnPrice,
        marca: product.marca,
        sizes: product.sizes,
        colors: product.colors,
        current_stock: product.stock,
      };

      console.log("📦 Producto a agregar:", newProduct);

      dispatchReturnData({
        type: 'ADD_RETURNED_PRODUCT',
        payload: { product, quantity, reason, newProduct }
      });

      console.log("✅ Producto agregado exitosamente para devolución");
      console.log("📋 Estado actual returned_products después de agregar:", returnData.returned_products.length + 1);
    } catch (error) {
      console.error("💥 ERROR en addReturnedProduct:", error);
      showSwal({
        icon: "error",
        title: "Error",
        text: "Error al agregar el producto para devolución",
      });
    }
  }, [showSwal, returnData.returned_products.length]);

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

  const handleCreateGiftCard = useCallback((amount, reason, autoCreated = false, giftCardId = null) => {
    console.log("🎁 INICIO handleCreateGiftCard", { amount, reason, autoCreated, giftCardId });

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

    // ✅ Si la GiftCard ya fue creada automáticamente, ir directo
    if (autoCreated && giftCardId) {
      console.log("🎁 GiftCard ya creada automáticamente, navegando directamente...");
      
      const navigationData = {
        clientName: originalReceipt.buyer_name || "",
        clientEmail: originalReceipt.buyer_email || "",
        clientPhone: originalReceipt.buyer_phone || "",
        totalAmount: amount,
        reason: reason,
        originalReceiptId: originalReceipt.id_receipt,
        returnProducts: returnData.returned_products,
        giftCardId: giftCardId,
        autoGenerated: true
      };

      navigate("/accountClient", {
        state: { 
          returnData: navigationData,
          giftCardCreated: true,
          mode: 'view'
        },
      });
      return;
    }

    // ✅ Flujo manual (cuando no se crea automáticamente)
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
          clientPhone: originalReceipt.buyer_phone || "",
          totalAmount: amount,
          reason: reason,
          originalReceiptId: originalReceipt.id_receipt,
          returnProducts: returnData.returned_products,
        };

        navigate("/accountClient", {
          state: { 
            returnData: navigationData,
            giftCardCreated: false,
            mode: 'create'
          },
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
    console.log("📊 Estado inicial de returnData:", returnData);
    console.log("📊 Totales calculados:", totals);
    console.log("📊 Recibo original:", originalReceipt?.id_receipt);
    console.log("📊 Documento cajero:", cashierDocument);

    if (returnData.returned_products.length === 0) {
      console.log("❌ Error: No hay productos para devolver");
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
        console.log("ℹ️ Cambio seleccionado pero sin productos nuevos");
        showSwal({
          icon: "info",
          title: "Info",
          text: "Para cambio, selecciona los productos nuevos",
        });
        return;
      }

      // ✅ CAMBIO: NO CREAR GIFTCARD AQUÍ, PROCESAR PRIMERO EN BACKEND
      console.log("🔄 Cambio con productos nuevos - diferencia:", totals.difference);
      console.log("🔄 Procesaremos en backend y después manejaremos GiftCard si es necesario");
    }

    // ✅ NUEVO: Si hay diferencia positiva (cliente debe pagar), mostrar modal de método de pago
    if (totals.difference > 0) {
      console.log("� Diferencia positiva detectada, mostrando modal de método de pago");
      setShowPaymentMethodModal(true);
      return;
    }

    // ✅ Si no hay diferencia positiva, proceder normalmente
    await processReturnNormally();
  }, [returnData, totals, originalReceipt, cashierDocument, handleCreditoEnTienda, showSwal]);

  // ✅ NUEVA FUNCIÓN: Procesar la devolución después de seleccionar método de pago
  const processReturnNormally = useCallback(async (paymentMethodForDifference = "") => {
    console.log("�🔄 Continuando con el procesamiento normal de devolución...");
    console.log("💳 Método de pago para diferencia:", paymentMethodForDifference);
    setLoading(true);

    // ✅ Validar que el documento del cajero está validado
    if (!cashierDocument || cashierDocument.trim() === "") {
      setLoading(false);
      showSwal({
        icon: "error",
        title: "Error",
        text: "Debes ingresar tu documento de cajero para procesar la devolución",
      });
      return;
    }

    // ✅ Verificar que el documento esté validado correctamente
    if (!cashierDocumentValidation.isValid) {
      setLoading(false);
      showSwal({
        icon: "error",
        title: "Error de Validación",
        text: cashierDocumentValidation.message || "El documento del cajero no es válido. Verifica que esté registrado en el sistema.",
      });
      return;
    }

    // ✅ Validar si aún se está validando
    if (cashierDocumentValidation.isValidating) {
      setLoading(false);
      showSwal({
        icon: "info",
        title: "Validando",
        text: "Por favor espera mientras se valida el documento del cajero...",
      });
      return;
    }

    try {
      const requestData = {
        original_receipt_id: originalReceipt.id_receipt,
        returned_products: returnData.returned_products,
        new_products: returnData.new_products,
        cashier_document: cashierDocument.trim(), // ✅ Asegurar que no hay espacios
        reason: returnData.reason,
        customer_payment_method: returnData.customer_payment_method,
        difference_payment_method: paymentMethodForDifference, // ✅ NUEVO: Método de pago para la diferencia
        processed_date: getColombiaDate(), // ✅ Usar fecha de Colombia
        totals: {
          totalReturned: totals.totalReturned,
          totalNewPurchase: totals.totalNewPurchase,
          difference: totals.difference,
        },
      };

      console.log("📤 DATOS COMPLETOS enviando al backend:");
      console.log("📤 original_receipt_id:", requestData.original_receipt_id);
      console.log("📤 returned_products:", requestData.returned_products);
      console.log("📤 new_products:", requestData.new_products);
      console.log("📤 cashier_document:", requestData.cashier_document);
      console.log("📤 customer_payment_method:", requestData.customer_payment_method);
      console.log("📤 difference_payment_method:", requestData.difference_payment_method); // ✅ NUEVO LOG
      console.log("📤 totals:", requestData.totals);
      console.log("📤 REQUEST DATA COMPLETO:", JSON.stringify(requestData, null, 2));

    const result = await dispatch(processReturn(requestData));
    console.log("📥 Respuesta del backend:", result);
    console.log("📥 Estructura completa de la respuesta:", JSON.stringify(result, null, 2));

    if (result && result.success) {
      console.log("✅ Devolución procesada exitosamente");
      console.log("📊 Datos de respuesta del backend:", result.data);
      
      // ✅ VERIFICAR QUE EL BACKEND HAYA ACTUALIZADO EL STOCK
      if (result.data?.stockUpdated) {
        console.log("✅ Backend confirmó actualización de stock");
      } else {
        console.warn("⚠️ Backend no confirmó actualización de stock");
      }

      // ✅ LOG DE PRODUCTOS ANTES DE ACTUALIZAR STOCK LOCAL
      console.log("📦 Productos devueltos a procesar:", returnData.returned_products.map(p => ({
        id: p.id_product,
        cantidad: p.quantity,
        accion: "DEVOLVER (aumentar stock)"
      })));
      
      console.log("📦 Productos nuevos a procesar:", returnData.new_products.map(p => ({
        id: p.id_product,
        cantidad: p.quantity,
        accion: "VENDER (disminuir stock)"
      })));

      // Actualizar productos devueltos (aumentar stock)
      returnData.returned_products.forEach((returnedProduct) => {
        console.log(`🔄 Actualizando stock LOCAL para producto devuelto ${returnedProduct.id_product}: +${returnedProduct.quantity}`);
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
        console.log(`🔄 Actualizando stock LOCAL para producto nuevo ${newProduct.id_product}: -${newProduct.quantity}`);
        dispatch({
          type: "UPDATE_PRODUCT_STOCK",
          payload: {
            id_product: newProduct.id_product,
            stock_change: -newProduct.quantity,
            reason: "EXCHANGE",
          },
        });
      });

      // ✅ RECARGAR PRODUCTOS DESDE BACKEND
      console.log("🔄 Recargando productos desde backend...");
      const fetchResult = await dispatch(fetchProducts());
      console.log("📦 Resultado de fetchProducts:", fetchResult);

      setReturnResult(result);
      setStep(4);

      // ✅ MANEJAR ACCIONES POST-PROCESAMIENTO SEGÚN LA DIFERENCIA
      if (totals.difference > 0) {
        // ✅ Obtener información del recibo creado
        const receiptInfo = result.data?.createdDocuments;
        const actionRequired = result.data?.actionRequired;

        console.log("📄 ReceiptInfo recibido del backend:", receiptInfo);
        console.log("📄 ActionRequired recibido del backend:", actionRequired);

        // ✅ Generar PDF automáticamente si hay receiptId
        if (actionRequired?.receiptId) {
          console.log("📄 Generando PDF automáticamente para recibo:", actionRequired.receiptId);
          setTimeout(() => {
            generateDifferenceReceiptPDF(receiptInfo, totals.difference, actionRequired, selectedPaymentMethod);
          }, 1000); // Delay para asegurar que el SweetAlert se muestre primero
        }

        showSwal({
          title: "✅ Devolución Procesada",
          html: `
            <div class="text-left">
              <p>✅ Stock actualizado correctamente</p>
              <p>💳 Cliente debe pagar diferencia: $${totals.difference.toLocaleString("es-CO")}</p>
              <p>📄 Recibo creado: #${actionRequired?.receiptId || 'N/A'}</p>
              <p>🖨️ PDF generándose automáticamente...</p>
            </div>
          `,
          icon: "success",
          showConfirmButton: true,
          confirmButtonText: "🖨️ Reimprimir PDF",
          showCancelButton: true,
          cancelButtonText: "Cerrar",
        }).then((result) => {
          if (result.isConfirmed && actionRequired?.receiptId) {
            // Permitir reimprimir el PDF
            generateDifferenceReceiptPDF(receiptInfo, totals.difference, actionRequired, selectedPaymentMethod);
          }
        });
      } else if (totals.difference === 0) {
        showSwal({
          title: "✅ Devolución Procesada",
          text: "Intercambio exacto - Stock actualizado correctamente",
          icon: "success",
          timer: 2000,
        });
      } else if (totals.difference < 0) {
        // ✅ CREAR GIFTCARD DESPUÉS DEL PROCESAMIENTO EXITOSO
        console.log("🎁 Procesamiento exitoso - ahora crear GiftCard por saldo a favor");
        
        // ✅ Obtener información de la GiftCard del backend
        const giftCardInfo = result.data?.createdDocuments;
        const actionRequired = result.data?.actionRequired;
        
        console.log("🎁 GiftCardInfo recibido del backend:", giftCardInfo);
        console.log("🎁 ActionRequired recibido del backend:", actionRequired);

        showSwal({
          title: "✅ Devolución Procesada",
          html: `
            <div class="text-left">
              <p>✅ Stock actualizado correctamente</p>
              <p>🎁 Saldo a favor: $${Math.abs(totals.difference).toLocaleString("es-CO")}</p>
              <p>💳 GiftCard creada: #${actionRequired?.giftCardId || 'N/A'}</p>
              <p>🎫 Redirigiendo al formulario de GiftCard...</p>
            </div>
          `,
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // ✅ NAVEGAR AUTOMÁTICAMENTE AL COMPONENTE DE GIFTCARD
          console.log("🎁 Navegando automáticamente a crear GiftCard...");
          
          const navigationData = {
            clientName: originalReceipt.buyer_name || "",
            clientEmail: originalReceipt.buyer_email || "",
            clientPhone: originalReceipt.buyer_phone || "",
            totalAmount: Math.abs(totals.difference),
            reason: `Saldo a favor por cambio - Recibo #${originalReceipt.id_receipt}`,
            originalReceiptId: originalReceipt.id_receipt,
            returnProducts: returnData.returned_products,
            newProducts: returnData.new_products,
            giftCardId: actionRequired?.giftCardId, // ✅ ID de la GiftCard ya creada
            autoGenerated: true, // ✅ Indicar que fue creada automáticamente
            returnId: result.data?.returnId // ✅ ID de la devolución
          };

          navigate("/accountClient", {
            state: { 
              returnData: navigationData,
              giftCardCreated: true, // ✅ Indicar que la GiftCard ya fue creada
              mode: 'view' // ✅ Modo visualización/imprimir en lugar de crear
            },
          });
        });
      }
      } else {
        // ✅ MANEJO DE ERRORES DEL BACKEND
        console.error("❌ Backend retornó error:", result);
        console.error("❌ Mensaje de error:", result?.message || "Sin mensaje");
        console.error("❌ Datos de error:", result?.data || "Sin datos");
        showSwal({
          icon: "error",
          title: "Error del servidor",
          text: result?.message || result?.error || "El servidor reportó un error al procesar la devolución",
        });
      }
    } catch (error) {
      console.error("💥 ERROR COMPLETO procesando devolución:", error);
      console.error("💥 ERROR mensaje:", error.message);
      console.error("💥 ERROR respuesta:", error.response?.data);
      console.error("💥 ERROR status:", error.response?.status);
      
      // ✅ Manejo específico para errores de documento de cajero
      const errorData = error.response?.data;
      let errorMessage = "Error al procesar la devolución";
      
      if (errorData?.code === 'INVALID_CASHIER_DOCUMENT') {
        errorMessage = `❌ ${errorData.error}\n\n💡 Verifica que tu documento esté correctamente registrado en el sistema.`;
      } else {
        errorMessage = errorData?.error || error.message || errorMessage;
      }
      
      showSwal({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      console.log("🏁 FINALIZANDO processReturnNormally");
      setLoading(false);
    }
  }, [
    returnData,
    totals,
    originalReceipt,
    cashierDocument,
    cashierDocumentValidation,
    dispatch,
    generateDifferenceReceiptPDF,
    handleCreateGiftCard,
    showSwal,
    getColombiaDate,
    fetchProducts,
    processReturn
  ]);

  // ✅ NUEVA FUNCIÓN: Confirmar método de pago y procesar
  const handleConfirmPaymentMethod = useCallback(async () => {
    if (!selectedPaymentMethod) {
      showSwal({
        icon: "error",
        title: "Error",
        text: "Selecciona un método de pago para continuar",
      });
      return;
    }

    console.log("💳 Método de pago seleccionado:", selectedPaymentMethod);
    setShowPaymentMethodModal(false);
    await processReturnNormally(selectedPaymentMethod);
  }, [selectedPaymentMethod, processReturnNormally, showSwal]);

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
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <div className="flex items-center space-x-2">
                      <span>ℹ️</span>
                      <span className="text-blue-800">
                        <strong>Saldo a favor:</strong> Se creará GiftCard automáticamente después de procesar la devolución.
                      </span>
                    </div>
                  </div>
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
                  <div className="relative">
                    <input
                      type="text"
                      value={cashierDocument}
                      onChange={(e) => handleCashierDocumentChange(e.target.value)}
                      placeholder="Ej: 12345678"
                      readOnly={!!user?.n_document}
                      className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                        user?.n_document 
                          ? 'bg-gray-100 cursor-not-allowed border-gray-300' 
                          : cashierDocumentValidation.isValidating
                            ? 'border-blue-300 focus:ring-blue-500'
                            : cashierDocumentValidation.isValid
                              ? 'border-green-300 focus:ring-green-500 bg-green-50'
                              : cashierDocument && !cashierDocumentValidation.isValid && !cashierDocumentValidation.isValidating
                                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    
                    {/* Indicador de estado de validación */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {cashierDocumentValidation.isValidating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      ) : cashierDocumentValidation.isValid ? (
                        <span className="text-green-500">✓</span>
                      ) : cashierDocument && !cashierDocumentValidation.isValid ? (
                        <span className="text-red-500">✗</span>
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Mensaje de validación */}
                  {cashierDocumentValidation.message && (
                    <p className={`text-sm mt-1 ${
                      cashierDocumentValidation.isValid 
                        ? 'text-green-600' 
                        : cashierDocumentValidation.isValidating
                          ? 'text-blue-600'
                          : 'text-red-600'
                    }`}>
                      {cashierDocumentValidation.message}
                    </p>
                  )}
                  
                  {user?.n_document && (
                    <p className="text-sm text-gray-500 mt-1">
                      🔒 Campo bloqueado - usando usuario autenticado
                    </p>
                  )}
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
                    <span className="font-medium">Fecha:</span> {formatDateForDisplay(originalReceipt.date)}
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

          {/* ✅ MODAL DE SELECCIÓN DE MÉTODO DE PAGO */}
          {showPaymentMethodModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  💳 Seleccionar Método de Pago
                </h3>
                
                <p className="text-gray-600 mb-4">
                  El cliente debe pagar una diferencia de{" "}
                  <span className="font-bold text-green-600">
                    ${totals.difference.toLocaleString("es-CO")}
                  </span>
                </p>
                
                <div className="space-y-3 mb-6">
                  {["Efectivo", "Tarjeta de Crédito", "Tarjeta de Débito", "Transferencia", "Nequi", "Daviplata"].map((method) => (
                    <label
                      key={method}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={selectedPaymentMethod === method}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-gray-900">{method}</span>
                    </label>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowPaymentMethodModal(false);
                      setSelectedPaymentMethod("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmPaymentMethod}
                    disabled={!selectedPaymentMethod}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

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