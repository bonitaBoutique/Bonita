import React, { useState, useEffect } from "react";
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

const ReturnManagement = () => {
  console.log("🎨 RENDER - ReturnManagement iniciando");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showSwal = (options) => {
    return Swal.fire({
      ...options,
      // ✅ EVITAR CARGAR IMÁGENES EXTERNAS
      imageUrl: undefined,
      iconHtml: undefined,
      backdrop: true,
      allowOutsideClick: true,
      // ✅ CONFIGURACIÓN ESPECÍFICA PARA EVITAR ERRORES DE RED
      customClass: {
        popup: "custom-swal-popup",
      },
    });
  };

  // ✅ SELECTORES
  const products = useSelector((state) => state.products || []);
  const productsLoading = useSelector((state) => state.loading);

  const { receipts, receiptsLoading, receiptsError, receiptsPagination } =
    useSelector((state) => state);

  // ✅ ESTADOS
  const [step, setStep] = useState(1);
  const [originalReceipt, setOriginalReceipt] = useState(null);
  const [receiptId, setReceiptId] = useState("");
  const [returnData, setReturnData] = useState({
    returned_products: [],
    new_products: [],
    reason: "",
    customer_payment_method: "Credito en tienda", // ✅ SIN EFECTIVO
  });
  const [loading, setLoading] = useState(false);
  const [cashierDocument, setCashierDocument] = useState("");
  const [returnResult, setReturnResult] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [newProductCodes, setNewProductCodes] = useState("");
  const [showNewProductsSection, setShowNewProductsSection] = useState(false);

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
  });

  // ✅ EFFECTS OPTIMIZADOS
  useEffect(() => {
    console.log("🔄 useEffect INICIAL - Componente montado");
    console.log("📦 Products en store:", products?.length);
    console.log("📋 Receipts en store:", receipts?.length);

    // ✅ SOLO CARGAR SI NO HAY DATOS
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
  }, []); // ✅ ARRAY VACÍO - Solo una vez al montar

  // ✅ useEffect separado para products con dependencia específica
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

  // ✅ FUNCIÓN BUSCAR RECIBO - SIN CAMBIOS PERO CON MÁS LOGS
  const searchReceipt = async () => {
    console.log("🔍 INICIO searchReceipt");
    console.log("📝 Datos de búsqueda:", {
      receiptId: receiptId.trim(),
      cashierDocument: cashierDocument.trim(),
    });

    if (!receiptId.trim()) {
      console.log("❌ Error: No hay receiptId");
      showSwal({
        title: "Error",
        text: "Ingresa el número del recibo",
        icon: "error",
      });
      return;
    }

    if (!cashierDocument.trim()) {
      console.log("❌ Error: No hay cashierDocument");
      showSwal({
        title: "Error",
        text: "Ingresa tu documento de cajero",
        icon: "error",
      });
      return;
    }

    console.log("🔄 Iniciando búsqueda...");
    setLoading(true);

    try {
      console.log("🔍 Buscando en receipts locales...");
      const localReceipt = receipts?.find(
        (receipt) => receipt.id_receipt.toString() === receiptId.trim()
      );

      if (localReceipt) {
        console.log(
          "✅ Recibo encontrado localmente:",
          localReceipt.id_receipt
        );

        const daysSinceReceipt = Math.floor(
          (new Date() - new Date(localReceipt.date)) / (1000 * 60 * 60 * 24)
        );

        console.log("📅 Días desde la compra:", daysSinceReceipt);

        if (daysSinceReceipt > 30) {
          console.log("⚠️ Recibo antiguo, solicitando confirmación...");
          const result = await showSwal({
            title: "⚠️ Recibo Antiguo",
            html: `
      <div class="text-left">
        <p>Este recibo tiene <strong>${daysSinceReceipt} días</strong> de antigüedad.</p>
        <p>La política estándar permite devoluciones hasta 30 días.</p>
        <br>
        <p>¿Deseas continuar con la devolución?</p>
      </div>
    `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "✅ Continuar",
            cancelButtonText: "❌ Cancelar",
          });

          if (!result.isConfirmed) {
            console.log("❌ Usuario canceló devolución de recibo antiguo");
            setLoading(false);
            return;
          }
          console.log("✅ Usuario confirmó devolución de recibo antiguo");
        }

        console.log("✅ Configurando recibo y avanzando al paso 2");
        setOriginalReceipt(localReceipt);
        setStep(2);

        showSwal({
          title: "✅ Recibo Encontrado",
          icon: "success",
          timer: 2000,
        });
      } else {
        console.log("🔍 No encontrado localmente, buscando en API...");
        try {
          const result = await dispatch(searchReceiptForReturn(receiptId));
          if (result && result.receipt) {
            console.log(
              "✅ Recibo encontrado en API:",
              result.receipt.id_receipt
            );
            setOriginalReceipt(result.receipt);
            setStep(2);
          }
        } catch (error) {
          console.log("❌ Error buscando en API:", error);
          showSwal("Error", "Recibo no encontrado", "error");
        }
      }
    } catch (error) {
      console.error("💥 Error general en búsqueda:", error);
      showSwal("Error", "Error al buscar el recibo", "error");
    } finally {
      console.log("🏁 Finalizando búsqueda, loading = false");
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN addReturnedProduct OPTIMIZADA CON LOGS
  const addReturnedProduct = (product, quantity, reason = "") => {
    console.log("🚀 INICIO addReturnedProduct");
    console.log("📦 Parámetros recibidos:");
    console.log("   - product.id_product:", product.id_product);
    console.log("   - product.description:", product.description);
    console.log("   - quantity:", quantity);
    console.log("   - reason:", reason);

    try {
      const existingIndex = returnData.returned_products.findIndex(
        (item) => item.id_product === product.id_product
      );

      let updatedProducts;
      if (existingIndex >= 0) {
        console.log("🔄 Actualizando producto existente");
        updatedProducts = [...returnData.returned_products];
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          quantity: quantity,
          reason: reason,
        };
      } else {
        console.log("➕ Agregando nuevo producto");
        const newProduct = {
          id_product: product.id_product,
          quantity: quantity,
          reason: reason,
          product_name: product.description,
          unit_price: product.priceSell,
          // ✅ AGREGAR CAMPOS ADICIONALES PARA EL STOCK
          marca: product.marca,
          sizes: product.sizes,
          colors: product.colors,
          current_stock: product.stock,
        };
        console.log("   - Nuevo producto:", newProduct);
        updatedProducts = [...returnData.returned_products, newProduct];
      }

      console.log("📋 Lista actualizada de productos:", updatedProducts);

      // ✅ ACTUALIZAR EL ESTADO LOCAL
      setReturnData((prevData) => {
        const newData = {
          ...prevData,
          returned_products: updatedProducts,
        };
        console.log("✅ Estado returnData actualizado:", newData);
        return newData;
      });

      // ✅ OPCIONAL: DESPACHAR ACCIÓN PARA ACTUALIZAR STOCK LOCALMENTE
      // Esto es para reflejar inmediatamente el cambio en la UI
      console.log("🔄 Actualizando stock local para UI...");

      // Solo actualizar visualmente, no persistir hasta confirmar la devolución
      setAvailableProducts((prevProducts) => {
        return prevProducts.map((p) => {
          if (p.id_product === product.id_product) {
            return {
              ...p,
              // Temporalmente mostrar que se "reservó" para devolución
              reserved_for_return:
                (p.reserved_for_return || 0) + parseInt(quantity),
            };
          }
          return p;
        });
      });

      console.log("✅ Producto agregado exitosamente para devolución");
    } catch (error) {
      console.error("💥 ERROR en addReturnedProduct:", error);
      console.error("📍 Stack trace:", error.stack);

      showSwal({
        icon: "error",
        title: "Error",
        text: "Error al agregar el producto para devolución",
      });
    }

    console.log("🏁 FIN addReturnedProduct");
  };

  const removeReturnedProduct = (productId) => {
    console.log("🗑️ INICIO removeReturnedProduct");
    console.log("📦 Eliminando producto:", productId);
    console.log("📋 Estado antes:", returnData.returned_products);

    setReturnData((prevData) => {
      const newData = {
        ...prevData,
        returned_products: prevData.returned_products.filter(
          (item) => item.id_product !== productId
        ),
      };
      console.log("📋 Estado después:", newData.returned_products);
      return newData;
    });

    console.log("🏁 FIN removeReturnedProduct");
  };

  // ✅ FUNCIÓN handleAddNewProducts OPTIMIZADA CON LOGS
  // ✅ FUNCIÓN CORREGIDA - handleAddNewProducts
  const handleAddNewProducts = () => {
    console.log("🚀 INICIO handleAddNewProducts");
    console.log("📝 newProductCodes:", newProductCodes);
    console.log("📦 availableProducts length:", availableProducts?.length);

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
      console.log(`🔍 Buscando producto: ${id_product}`);

      const product = availableProducts.find(
        (p) => p.id_product === id_product
      );
      console.log("📦 Producto encontrado:", product);

      if (product) {
        if (product.stock > 0) {
          const existingProduct = returnData.new_products.find(
            (p) => p.id_product === id_product
          );

          if (existingProduct) {
            console.log("ℹ️ Producto ya está en la lista:", id_product);
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

            console.log("✅ Agregando producto:", productToAdd);
            productsToAdd.push(productToAdd);
          }
        } else {
          console.log("❌ Sin stock:", id_product);
          outOfStockCodes.push(id_product);
        }
      } else {
        console.log("❌ No encontrado:", id_product);
        notFoundCodes.push(id_product);
      }
    });

    // ✅ MOSTRAR ERRORES SIN NAVEGACIÓN

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

    // ✅ AGREGAR PRODUCTOS VÁLIDOS
    if (productsToAdd.length > 0) {
  console.log("✅ Agregando productos válidos:", productsToAdd);

  setReturnData((prev) => {
    const newState = {
      ...prev,
      new_products: [...prev.new_products, ...productsToAdd],
    };
    console.log("📊 Nuevo estado returnData:", newState);
    return newState;
  });

  showSwal({
    icon: "success",
    title: "Productos agregados",
    text: `Se agregaron ${productsToAdd.length} producto(s) exitosamente.`,
    timer: 1500,
    showConfirmButton: false,
  });
}

    // ✅ LIMPIAR INPUT
    setNewProductCodes("");
    console.log("🏁 FIN handleAddNewProducts");
  };

  const handleNewProductQuantityChange = (id_product, quantity) => {
    console.log("🔢 INICIO handleNewProductQuantityChange");
    console.log("📦 Producto:", id_product);
    console.log("📊 Nueva cantidad:", quantity);

    const numQuantity = Number(quantity);

    if (numQuantity < 1) {
      console.log("❌ Cantidad inválida: menor a 1");
      showSwal({
        icon: "warning",
        title: "Cantidad inválida",
        text: "La cantidad debe ser mayor a 0.",
      });
      return;
    }

    const product = returnData.new_products.find(
      (p) => p.id_product === id_product
    );

    console.log("📦 Producto encontrado:", product);
    console.log("📊 Stock disponible:", product?.stock);

    if (product && numQuantity > product.stock) {
      console.log("❌ Cantidad excede stock disponible");
      showSwal({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo hay ${product.stock} unidades disponibles.`,
      });
      return;
    }

    console.log("✅ Actualizando cantidad del producto");
    setReturnData((prev) => {
      const newState = {
        ...prev,
        new_products: prev.new_products.map((item) =>
          item.id_product === id_product
            ? { ...item, quantity: numQuantity }
            : item
        ),
      };
      console.log("📋 Estado actualizado:", newState.new_products);
      return newState;
    });

    console.log("🏁 FIN handleNewProductQuantityChange");
  };

  const removeNewProduct = (productId) => {
    console.log("🗑️ INICIO removeNewProduct");
    console.log("📦 Eliminando producto:", productId);

    setReturnData((prev) => {
      const newState = {
        ...prev,
        new_products: prev.new_products.filter(
          (item) => item.id_product !== productId
        ),
      };
      console.log("📋 Productos restantes:", newState.new_products);
      return newState;
    });

    console.log("🏁 FIN removeNewProduct");
  };

  // ✅ CALCULAR TOTALES - CON LOGS
  const calculateTotals = () => {
    console.log("🧮 INICIO calculateTotals");
    console.log(
      "📋 returnData.returned_products:",
      returnData.returned_products
    );
    console.log("📋 returnData.new_products:", returnData.new_products);

    const totalReturned = returnData.returned_products.reduce((sum, item) => {
      const itemTotal = (item.unit_price || 0) * (item.quantity || 0);
      console.log(`💰 Producto devuelto: ${item.product_name} = ${itemTotal}`);
      return sum + itemTotal;
    }, 0);

    const totalNewPurchase = returnData.new_products.reduce((sum, item) => {
      const itemTotal = (item.unit_price || 0) * (item.quantity || 0);
      console.log(`💰 Producto nuevo: ${item.product_name} = ${itemTotal}`);
      return sum + itemTotal;
    }, 0);

    const difference = totalNewPurchase - totalReturned;

    const totals = {
      totalReturned,
      totalNewPurchase,
      difference,
    };

    console.log("📊 Totales calculados:", totals);
    console.log("🏁 FIN calculateTotals");

    return totals;
  };

  // ✅ RESTO DE LAS FUNCIONES SIN CAMBIOS...
  const handleCreateGiftCard = (amount, reason) => {
    console.log("🎁 INICIO handleCreateGiftCard");
    console.log("💰 Monto recibido:", amount);
    console.log("📝 Razón recibida:", reason);
    console.log("📋 originalReceipt:", originalReceipt);

    if (!originalReceipt) {
      console.log("❌ No hay recibo original");
       showSwal({
    title: "Error",
    text: "No se encontró información del recibo original",
    icon: "error"
  });
  
  return;
}
    if (!amount || amount <= 0) {
      console.log("❌ Monto inválido:", amount);
      showSwal({
        title: "Error",
        text: "Monto inválido para crear GiftCard",
        icon: "error",
      });
      return;
    }

    console.log("✅ Mostrando modal de confirmación...");

    showSwal({
      title: "🎁 Crear GiftCard para Cliente",
      html: `
    <div class="text-left">
      <p><strong>Cliente:</strong> ${
        originalReceipt.buyer_name || "No especificado"
      }</p>
      <p><strong>Email:</strong> ${
        originalReceipt.buyer_email || "No especificado"
      }</p>
      <p><strong>Monto a acreditar:</strong> $${amount.toLocaleString(
        "es-CO"
      )}</p>
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
    })
      .then((result) => {
        console.log("📝 Respuesta del usuario:", result);

        if (result.isConfirmed) {
          console.log("✅ Usuario confirmó creación de GiftCard");
          console.log("🚀 Navegando a /panel/saldo-cliente...");

          const navigationData = {
            clientName: originalReceipt.buyer_name || "",
            clientEmail: originalReceipt.buyer_email || "",
            totalAmount: amount,
            reason: reason,
            originalReceiptId: originalReceipt.id_receipt,
            returnProducts: returnData.returned_products,
          };

          console.log("📦 Datos de navegación:", navigationData);

          navigate("/accountClient", {
            state: {
              returnData: navigationData,
            },
          });

          console.log("✅ Navegación ejecutada");
        } else {
          console.log("❌ Usuario canceló creación de GiftCard");
        }
      })
      .catch((error) => {
        console.error("💥 ERROR en SweetAlert:", error);
      });

    console.log("🏁 FIN handleCreateGiftCard");
  };

  const handleCreditoEnTienda = () => {
    console.log("🏪 INICIO handleCreditoEnTienda");
    console.log(
      "📋 returnData.returned_products:",
      returnData.returned_products
    );
    console.log(
      "📊 returnData.returned_products.length:",
      returnData.returned_products.length
    );

    if (returnData.returned_products.length === 0) {
      console.log("❌ No hay productos para devolver");
      showSwal({
        title: "Error",
        text: "Selecciona productos para devolver primero",
        icon: "error",
      });

      return;
    }

    const totalToRefund = calculateTotals().totalReturned;
    console.log("💰 Total a reembolsar:", totalToRefund);

    if (totalToRefund <= 0) {
      console.log("❌ Total a reembolsar es 0 o negativo");
      showSwal({
        title: "Error",
        text: "No hay monto válido para crear GiftCard",
        icon: "error",
      });

      return;
    }

    console.log("✅ Llamando handleCreateGiftCard...");
    handleCreateGiftCard(
      totalToRefund,
      `Devolución directa - Recibo #${originalReceipt.id_receipt}`
    );

    console.log("🏁 FIN handleCreditoEnTienda");
  };

  const handleProcessReturnWithDifference = async () => {
    console.log("⚙️ INICIO handleProcessReturnWithDifference");

    if (returnData.returned_products.length === 0) {
      console.log("❌ No hay productos para devolver");
      showSwal({
        icon: "error",
        title: "Error",
        text: "Selecciona al menos un producto para devolver",
      });
      return;
    }

    const totals = calculateTotals();
    console.log("📊 Totales para procesamiento:", totals);

    // ✅ CASOS QUE REQUIEREN CREAR GIFTCARD
    if (returnData.customer_payment_method === "Credito en tienda") {
      console.log("🎁 Caso: Crédito en tienda, redirigiendo a GiftCard...");
      handleCreditoEnTienda();
      return;
    }

    if (returnData.customer_payment_method === "Cambio") {
      if (returnData.new_products.length === 0) {
        console.log("❌ Cambio sin productos nuevos");
        showSwal({
          icon: "info",
          title: "Info",
          text: "Para cambio, selecciona los productos nuevos",
        });
        return;
      }

      // Caso: Cambio con saldo a favor del cliente
      if (totals.difference < 0) {
        console.log("🎁 Caso: Saldo a favor del cliente, creando GiftCard...");
        handleCreateGiftCard(
          Math.abs(totals.difference),
          `Saldo a favor por cambio - Recibo #${originalReceipt.id_receipt}`
        );
        return;
      }
    }

    // ✅ CASOS QUE SE PROCESAN AQUÍ MISMO
    console.log("⚙️ Procesando devolución directamente...");
    setLoading(true);

    try {
      const requestData = {
        original_receipt_id: originalReceipt.id_receipt,
        returned_products: returnData.returned_products,
        new_products: returnData.new_products,
        cashier_document: cashierDocument,
        reason: returnData.reason,
        customer_payment_method: returnData.customer_payment_method,
        totals: {
          totalReturned: totals.totalReturned,
          totalNewPurchase: totals.totalNewPurchase,
          difference: totals.difference,
        },
      };

      console.log("📤 Enviando datos al backend:", requestData);

      // ✅ AQUÍ ES DONDE SE DESPACHA LA ACCIÓN PRINCIPAL
      const result = await dispatch(processReturn(requestData));
      console.log("📥 Respuesta del backend:", result);

      if (result.success) {
        console.log("✅ Devolución procesada exitosamente");

        // ✅ ACTUALIZAR STOCK LOCAL DESPUÉS DE ÉXITO
        console.log("🔄 Actualizando stock local después del éxito...");

        // Actualizar productos devueltos (aumentar stock)
        returnData.returned_products.forEach((returnedProduct) => {
          console.log(
            `📈 Aumentando stock de ${returnedProduct.id_product} en ${returnedProduct.quantity}`
          );

          // Despachar acción para actualizar stock individual
          dispatch({
            type: "UPDATE_PRODUCT_STOCK",
            payload: {
              id_product: returnedProduct.id_product,
              stock_change: +returnedProduct.quantity, // Positivo = aumentar stock
              reason: "RETURN",
            },
          });
        });

        // Actualizar productos nuevos (disminuir stock)
        returnData.new_products.forEach((newProduct) => {
          console.log(
            `📉 Disminuyendo stock de ${newProduct.id_product} en ${newProduct.quantity}`
          );

          dispatch({
            type: "UPDATE_PRODUCT_STOCK",
            payload: {
              id_product: newProduct.id_product,
              stock_change: -newProduct.quantity, // Negativo = disminuir stock
              reason: "EXCHANGE",
            },
          });
        });

        // ✅ REFRESCAR PRODUCTOS DESDE EL SERVIDOR
        console.log("🔄 Refrescando productos desde servidor...");
        await dispatch(fetchProducts());

        setReturnResult(result);
        setStep(4);

        if (totals.difference > 0) {
          console.log("💳 Cliente debe pagar diferencia");
          showSwal({
            title: "✅ Devolución Procesada",
            html: `
            <div class="text-left">
              <p>✅ Stock actualizado correctamente</p>
              <p>💳 Cliente debe pagar diferencia: $${totals.difference.toLocaleString(
                "es-CO"
              )}</p>
              <p>📄 Generar recibo por la diferencia</p>
            </div>
          `,
            icon: "success",
            timer: 3000,
          });
        } else if (totals.difference === 0) {
          console.log("⚖️ Intercambio exacto");
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
      console.error("📍 Detalles del error:", error.response?.data);
      showSwal({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Error al procesar la devolución",
      });
    } finally {
      console.log("🏁 Finalizando procesamiento, loading = false");
      setLoading(false);
    }

    console.log("🏁 FIN handleProcessReturnWithDifference");
  };

  // ✅ COMPONENTE DE ANÁLISIS DE CAMBIO
  const CalculationSummary = () => {
    console.log("📊 RENDER CalculationSummary");

    const totals = calculateTotals();

    // ✅ NO MOSTRAR SI NO HAY PRODUCTOS DEVUELTOS
    if (returnData.returned_products.length === 0) {
      console.log("📊 Sin productos devueltos, no mostrando cálculos");
      return null;
    }

    console.log("📊 Renderizando CalculationSummary con totales:", totals);

    return (
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-3 flex items-center">
          <span className="mr-2">🧮</span>
          Resumen de Cálculos
        </h4>

        <div className="space-y-3">
          {/* Total a devolver */}
          <div className="flex justify-between items-center p-2 bg-red-50 rounded">
            <span className="text-red-800">💰 Total a devolver:</span>
            <span className="font-bold text-red-600">
              ${totals.totalReturned.toLocaleString("es-CO")}
            </span>
          </div>

          {/* Si hay productos nuevos */}
          {returnData.customer_payment_method === "Cambio" &&
            returnData.new_products.length > 0 && (
              <>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-purple-800">
                    🛍️ Total productos nuevos:
                  </span>
                  <span className="font-bold text-purple-600">
                    ${totals.totalNewPurchase.toLocaleString("es-CO")}
                  </span>
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded font-bold text-lg">
                    <span>⚖️ Resultado:</span>
                    <span
                      className={`${
                        totals.difference === 0
                          ? "text-gray-600"
                          : totals.difference > 0
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {totals.difference === 0
                        ? "✅ Cambio exacto"
                        : totals.difference > 0
                        ? `💳 Cliente paga: $${totals.difference.toLocaleString(
                            "es-CO"
                          )}`
                        : `🎁 GiftCard por: $${Math.abs(
                            totals.difference
                          ).toLocaleString("es-CO")}`}
                    </span>
                  </div>

                  <div
                    className="text-xs text-center mt-2 p-2 rounded"
                    style={{
                      backgroundColor:
                        totals.difference === 0
                          ? "#f3f4f6"
                          : totals.difference > 0
                          ? "#fee2e2"
                          : "#dbeafe",
                    }}
                  >
                    {totals.difference === 0 &&
                      "🎯 Intercambio perfecto - Sin pagos adicionales"}
                    {totals.difference > 0 &&
                      "💳 Se procesará pago por diferencia aquí mismo"}
                    {totals.difference < 0 &&
                      "🎁 Se creará GiftCard manualmente con el saldo a favor"}
                  </div>

                  {/* ✅ BOTÓN PARA SALDO A FAVOR */}
                  {totals.difference < 0 && (
                    <button
                      onClick={(e) => {
                        console.log(
                          "🚀 CLICK - Botón Crear GiftCard por Saldo a Favor"
                        );

                        e.preventDefault();
                        e.stopPropagation();

                        try {
                          handleCreateGiftCard(
                            Math.abs(totals.difference),
                            `Saldo a favor por cambio - Recibo #${originalReceipt.id_receipt}`
                          );
                        } catch (error) {
                          console.error(
                            "💥 ERROR en botón saldo a favor:",
                            error
                          );
                        }
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
                {returnData.customer_payment_method === "Credito en tienda" &&
                  "🎁 Crédito en Tienda"}
                {returnData.customer_payment_method === "Cambio" &&
                  "🔄 Cambio de productos"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ COMPONENTE DE RESULTADO
  const ResultStep = () => {
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
            💵 Reembolso: $
            {calculateTotals().totalReturned.toLocaleString("es-CO")}
          </h4>
          <p>Método: {returnData.customer_payment_method}</p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              setStep(1);
              setOriginalReceipt(null);
              setReceiptId("");
              setReturnData({
                returned_products: [],
                new_products: [],
                reason: "",
                customer_payment_method: "Credito en tienda", // ✅ SIN EFECTIVO
              });
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
  };

  // ✅ RETURN PRINCIPAL DEL COMPONENTE
  return (
    <>
      <Navbar2 />
      <div className="min-h-screen bg-gray-100 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔄 Gestión de Devoluciones
            </h1>
            <p className="text-gray-600">
              Sistema de devolución y cambio de productos
            </p>
          </div>

          {/* Indicador de Pasos */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step >= stepNum ? "bg-blue-500 text-white" : "bg-gray-300"
                    }`}
                  >
                    {stepNum}
                  </div>
                  <div className="text-sm ml-2">
                    {stepNum === 1 && "Buscar Recibo"}
                    {stepNum === 2 && "Seleccionar Productos"}
                    {stepNum === 3 && "Confirmar"}
                    {stepNum === 4 && "Resultado"}
                  </div>
                  {stepNum < 4 && (
                    <div
                      className={`w-8 h-0.5 ml-2 ${
                        step > stepNum ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PASO 1: BUSCAR RECIBO */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                🔍 Buscar Recibo Original
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="text-2xl mr-3">💡</div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">
                      ¿Cómo funciona?
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>
                        • Ingresa el <strong>número del recibo</strong> que
                        aparece en el ticket
                      </li>
                      <li>
                        • Verifica que sea un recibo válido para devolución
                      </li>
                      <li>
                        • La política permite devoluciones hasta{" "}
                        <strong>30 días</strong>
                      </li>
                      <li>
                        • Casos especiales pueden procesarse con autorización
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🧾 Número del Recibo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={receiptId}
                      onChange={(e) => setReceiptId(e.target.value)}
                      placeholder="Ej: 12345 o REC-2024-001"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || receiptsLoading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <span className="text-gray-400">🔢</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Busca este número en la parte superior del recibo impreso
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👤 Tu Documento (Cajero){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cashierDocument}
                      onChange={(e) => setCashierDocument(e.target.value)}
                      placeholder="Tu número de documento"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || receiptsLoading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <span className="text-gray-400">🆔</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Para registrar quién procesa la devolución
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={searchReceipt}
                  disabled={
                    loading ||
                    receiptsLoading ||
                    !receiptId.trim() ||
                    !cashierDocument.trim()
                  }
                  className="bg-blue-500 text-white px-8 py-3 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                >
                  {loading || receiptsLoading ? (
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

              {receiptsLoading && (
                <div className="mt-4 text-center text-gray-500 text-sm">
                  📋 Cargando lista de recibos...
                </div>
              )}

              <div className="mt-8 border-t pt-6">
                <h4 className="font-medium text-gray-700 mb-4">
                  ⚡ Accesos Rápidos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate("/returns/history")}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center"
                  >
                    📋 Ver Historial
                  </button>
                  <button
                    onClick={() => navigate("/panel/productos")}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center"
                  >
                    📦 Panel Productos
                  </button>
                  <button
                    onClick={() => dispatch(fetchAllReceipts())}
                    disabled={receiptsLoading}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center disabled:opacity-50"
                  >
                    🔄 Actualizar Recibos
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: SELECCIONAR PRODUCTOS */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                📋 Seleccionar Productos para Devolución
              </h3>

              {/* Información del recibo */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-2">📄 Información del Recibo</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID Recibo:</span>
                    <div className="font-medium">
                      {originalReceipt.id_receipt}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Cliente:</span>
                    <div className="font-medium">
                      {originalReceipt.buyer_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha:</span>
                    <div className="font-medium">
                      {new Date(originalReceipt.date).toLocaleDateString(
                        "es-CO"
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <div className="font-medium text-green-600">
                      ${originalReceipt.total_amount?.toLocaleString("es-CO")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de productos del recibo */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">🛍️ Productos en el Recibo</h4>
                {originalReceipt.OrderDetail &&
                originalReceipt.OrderDetail.products &&
                originalReceipt.OrderDetail.products.length > 0 ? (
                  <div className="space-y-3">
                    {originalReceipt.OrderDetail.products.map(
                      (product, productIndex) => {
                        const isSelected = returnData.returned_products.some(
                          (item) => item.id_product === product.id_product
                        );
                        const selectedProduct =
                          returnData.returned_products.find(
                            (item) => item.id_product === product.id_product
                          );

                        const originalQuantity =
                          originalReceipt.OrderDetail.quantity || 1;

                        return (
                          <div
                            key={productIndex}
                            className={`border rounded-lg p-4 transition-all duration-200 ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 mb-1">
                                  {product.description}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div className="flex items-center space-x-4">
                                    <span>
                                      ID: <strong>{product.id_product}</strong>
                                    </span>
                                    <span>
                                      Marca: <strong>{product.marca}</strong>
                                    </span>
                                    <span>
                                      Talla: <strong>{product.sizes}</strong>
                                    </span>
                                    <span>
                                      Color: <strong>{product.colors}</strong>
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span>
                                      Precio:{" "}
                                      <strong>
                                        $
                                        {product.priceSell?.toLocaleString(
                                          "es-CO"
                                        )}
                                      </strong>
                                    </span>
                                    <span>
                                      Cantidad comprada:{" "}
                                      <strong>{originalQuantity}</strong>
                                    </span>
                                    <span>
                                      Total:{" "}
                                      <strong>
                                        $
                                        {(
                                          product.priceSell * originalQuantity
                                        )?.toLocaleString("es-CO")}
                                      </strong>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {!isSelected ? (
                                <div className="flex items-center space-x-3 ml-4">
                                  <div className="flex flex-col items-center space-y-2">
                                    <label className="text-xs text-gray-600">
                                      Cantidad a devolver:
                                    </label>
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
                                    <label className="text-xs text-gray-600">
                                      Motivo:
                                    </label>
                                    <select
                                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      id={`reason-${product.id_product}`}
                                    >
                                      <option value="">Seleccionar...</option>
                                      <option value="Defectuoso">
                                        Defectuoso
                                      </option>
                                      <option value="Talla incorrecta">
                                        Talla incorrecta
                                      </option>
                                      <option value="No le gustó">
                                        No le gustó
                                      </option>
                                      <option value="Color diferente">
                                        Color diferente
                                      </option>
                                      <option value="Cambio de opinión">
                                        Cambio de opinión
                                      </option>
                                      <option value="Otro">Otro</option>
                                    </select>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      console.log("🚀 CLICK - Botón Devolver");
                                      console.log(
                                        "📦 Producto:",
                                        product.id_product
                                      );
                                      console.log(
                                        "📝 Product completo:",
                                        product
                                      );

                                      // ✅ CRÍTICO: Prevenir CUALQUIER navegación
                                      e.preventDefault();
                                      e.stopPropagation();

                                      // ✅ DETENER propagación inmediata
                                      if (e.nativeEvent) {
                                        e.nativeEvent.stopImmediatePropagation();
                                      }

                                      // ✅ Prevenir submit si está dentro de un form
                                      if (e.target.form) {
                                        console.log(
                                          "⚠️ Form detectado - Previniendo submit"
                                        );
                                        e.target.form.onsubmit = (
                                          formEvent
                                        ) => {
                                          formEvent.preventDefault();
                                          return false;
                                        };
                                      }

                                      try {
                                        console.log(
                                          "🔍 Obteniendo valores del DOM..."
                                        );

                                        const qtyElement =
                                          document.getElementById(
                                            `qty-${product.id_product}`
                                          );
                                        const reasonElement =
                                          document.getElementById(
                                            `reason-${product.id_product}`
                                          );

                                        console.log("📊 Elementos DOM:", {
                                          qtyElement: qtyElement?.value,
                                          reasonElement: reasonElement?.value,
                                        });

                                        const qty =
                                          parseInt(qtyElement?.value) || 1;
                                        const reason = reasonElement?.value;

                                        console.log("📋 Valores extraídos:", {
                                          qty,
                                          reason,
                                        });

                                        if (!reason) {
                                          console.log("❌ Motivo requerido");
                                          showSwal({
                                            icon: "warning",
                                            title: "Motivo requerido",
                                            text: "Selecciona un motivo para la devolución",
                                            timer: 2000,
                                          });
                                          return;
                                        }

                                        console.log(
                                          "✅ Validaciones pasadas, agregando producto..."
                                        );
                                        console.log("📦 Datos a agregar:", {
                                          product: product.id_product,
                                          quantity: qty,
                                          reason: reason,
                                        });

                                        // ✅ AGREGAR EL PRODUCTO
                                        addReturnedProduct(
                                          product,
                                          qty,
                                          reason
                                        );

                                        console.log(
                                          "✅ Producto agregado exitosamente"
                                        );

                                        // ✅ MOSTRAR CONFIRMACIÓN
                                        showSwal({
                                          icon: "success",
                                          title: "✅ Producto agregado",
                                          text: `${product.description} agregado para devolución`,
                                          timer: 1500,
                                          showConfirmButton: false,
                                        });

                                        console.log(
                                          "🏁 Proceso completado sin navegación"
                                        );
                                      } catch (error) {
                                        console.error(
                                          "💥 ERROR en botón Devolver:",
                                          error
                                        );
                                        console.error(
                                          "📍 Stack trace:",
                                          error.stack
                                        );

                                        showSwal({
                                          icon: "error",
                                          title: "Error",
                                          text: "Ocurrió un error al agregar el producto",
                                        });
                                      }
                                    }}
                                    type="button" // ✅ CRÍTICO: Especificar tipo explícitamente
                                    className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex items-center space-x-1"
                                  >
                                    <span>➕</span>
                                    <span>Devolver</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-3 ml-4">
                                  <div className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded">
                                    <div>
                                      <strong>Cantidad:</strong>{" "}
                                      {selectedProduct.quantity}
                                    </div>
                                    <div>
                                      <strong>Motivo:</strong>{" "}
                                      {selectedProduct.reason}
                                    </div>
                                    <div>
                                      <strong>Subtotal:</strong> $
                                      {(
                                        selectedProduct.unit_price *
                                        selectedProduct.quantity
                                      ).toLocaleString("es-CO")}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() =>
                                      removeReturnedProduct(product.id_product)
                                    }
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
                      }
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-2">📦</div>
                    <p>No se encontraron productos en este recibo</p>
                    <p className="text-sm">
                      Verifica que el recibo tenga productos asociados
                    </p>
                  </div>
                )}
              </div>

              {/* ✅ MÉTODO DE REEMBOLSO SIN EFECTIVO */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">💰 Método de Reembolso</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CRÉDITO EN TIENDA */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      returnData.customer_payment_method === "Credito en tienda"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => {
                      setReturnData({
                        ...returnData,
                        customer_payment_method: "Credito en tienda",
                      });
                      setShowNewProductsSection(false);
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="Credito en tienda"
                      checked={
                        returnData.customer_payment_method ===
                        "Credito en tienda"
                      }
                      readOnly
                      className="mb-2"
                    />
                    <div className="font-medium text-blue-600">
                      🎁 Crédito en Tienda
                    </div>
                    <div className="text-sm text-gray-600">
                      Gift card para futuras compras
                    </div>

                    {/* BOTÓN DIRECTO PARA CREAR GIFTCARD */}
                    {returnData.customer_payment_method ===
                      "Credito en tienda" &&
                      returnData.returned_products.length > 0 && (
                        <button
                          onClick={(e) => {
                            console.log(
                              "🚀 CLICK - Botón Ir a Crear GiftCard (Crédito en Tienda)"
                            );
                            console.log("🎯 Event:", e);
                            console.log(
                              "📦 returnData.returned_products:",
                              returnData.returned_products
                            );
                            console.log(
                              "📊 returnData.returned_products.length:",
                              returnData.returned_products.length
                            );

                            e.preventDefault();
                            e.stopPropagation();

                            if (e.nativeEvent) {
                              e.nativeEvent.stopImmediatePropagation();
                            }

                            try {
                              console.log(
                                "🔄 Ejecutando handleCreditoEnTienda..."
                              );
                              handleCreditoEnTienda();
                              console.log("✅ handleCreditoEnTienda ejecutado");
                            } catch (error) {
                              console.error(
                                "💥 ERROR en botón crédito tienda:",
                                error
                              );
                              console.error("📍 Stack trace:", error.stack);
                            }
                          }}
                          className="mt-3 w-full bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          🎁 Ir a Crear GiftCard
                        </button>
                      )}
                  </div>

                  {/* CAMBIO POR PRODUCTOS */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      returnData.customer_payment_method === "Cambio"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() => {
                      setReturnData({
                        ...returnData,
                        customer_payment_method: "Cambio",
                      });
                      setShowNewProductsSection(true);
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="Cambio"
                      checked={returnData.customer_payment_method === "Cambio"}
                      readOnly
                      className="mb-2"
                    />
                    <div className="font-medium text-purple-600">
                      🔄 Cambio por Otro Producto
                    </div>
                    <div className="text-sm text-gray-600">
                      Seleccionar nuevos productos
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de productos nuevos para cambio */}
              {returnData.customer_payment_method === "Cambio" && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-purple-800 flex items-center">
                      <span className="mr-2">🔄</span>
                      Productos de Cambio
                    </h4>
                    <button
                      onClick={() =>
                        setShowNewProductsSection(!showNewProductsSection)
                      }
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      type="button" // ✅ AGREGAR ESTO
                    >
                      {showNewProductsSection ? "▼ Ocultar" : "▶ Mostrar"}{" "}
                      Selector
                    </button>
                  </div>

                  {showNewProductsSection && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-purple-700 mb-2">
                        Códigos de productos (separados por coma)
                      </label>
                      {/* ✅ REEMPLAZAR ESTA SECCIÓN COMPLETA */}
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newProductCodes}
                          onChange={(e) => setNewProductCodes(e.target.value)}
                          placeholder="Ej: PROD001, PROD002, PROD003"
                          className="flex-1 p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          onKeyDown={(e) => {
                            // ✅ PREVENIR SUBMIT EN ENTER
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddNewProducts();
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            console.log(
                              "🚀 CLICK - Botón Agregar productos nuevos"
                            );

                            e.preventDefault();
                            e.stopPropagation();

                            try {
                              handleAddNewProducts();
                            } catch (error) {
                              console.error(
                                "💥 ERROR en botón Agregar:",
                                error
                              );
                            }
                          }}
                          type="button" // ✅ IMPORTANTE: Especificar tipo button
                          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                        >
                          ➕ Agregar
                        </button>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">
                        Ingresa los códigos de los productos que el cliente
                        quiere llevarse
                      </p>
                    </div>
                  )}

                  {/* Lista de productos nuevos seleccionados */}
                  {returnData.new_products.length > 0 ? (
                    <div>
                      <h5 className="font-medium text-purple-800 mb-3">
                        Productos Seleccionados (
                        {returnData.new_products.length})
                      </h5>
                      <div className="space-y-3">
                        {returnData.new_products.map((product, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {product.product_name}
                              </div>
                              <div className="text-sm text-gray-600">
                                <span>Código: {product.id_product}</span>
                                <span className="ml-3">
                                  Precio: $
                                  {product.unit_price?.toLocaleString("es-CO")}
                                </span>
                                <span className="ml-3">
                                  Stock: {product.stock}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="flex flex-col items-center">
                                <label className="text-xs text-gray-600 mb-1">
                                  Cantidad:
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max={product.stock}
                                  value={product.quantity || 1}
                                  onChange={(e) =>
                                    handleNewProductQuantityChange(
                                      product.id_product,
                                      e.target.value
                                    )
                                  }
                                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                              </div>

                              <div className="text-center">
                                <div className="text-xs text-gray-600">
                                  Subtotal:
                                </div>
                                <div className="font-medium text-purple-600">
                                  $
                                  {(
                                    product.unit_price * (product.quantity || 1)
                                  ).toLocaleString("es-CO")}
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  removeNewProduct(product.id_product)
                                }
                                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                                title="Eliminar producto"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-purple-800">
                            Total productos nuevos:
                          </span>
                          <span className="text-purple-600">
                            $
                            {calculateTotals().totalNewPurchase.toLocaleString(
                              "es-CO"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-purple-600">
                      <p>No hay productos seleccionados para el cambio</p>
                      <p className="text-sm text-gray-500">
                        {showNewProductsSection
                          ? "Usa el campo de arriba para agregar productos"
                          : 'Haz clic en "Mostrar Selector" para agregar productos'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ COMPONENTE DE CÁLCULOS */}
              <CalculationSummary />

              {/* Comentarios */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Comentarios Adicionales sobre la Devolución
                </label>
                <textarea
                  value={returnData.reason}
                  onChange={(e) =>
                    setReturnData({ ...returnData, reason: e.target.value })
                  }
                  placeholder="Describe brevemente el motivo general de la devolución o cualquier observación importante..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Opcional: Agrega comentarios adicionales que consideres
                  relevantes
                </p>
              </div>

              {/* ✅ BOTONES DE NAVEGACIÓN MEJORADOS */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <span>⬅️</span>
                  <span>Volver</span>
                </button>

                <div className="flex items-center space-x-4">
                  {returnData.returned_products.length > 0 && (
                    <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded">
                      {returnData.returned_products.length} producto(s) para
                      devolver
                      {returnData.customer_payment_method === "Cambio" &&
                        returnData.new_products.length > 0 && (
                          <span className="block">
                            + {returnData.new_products.length} producto(s)
                            nuevos
                          </span>
                        )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (returnData.returned_products.length === 0) {
                        showSwal({
                          title: "Error",
                          text: "Selecciona al menos un producto para devolver",
                          icon: "error",
                        });

                        return;
                      }

                      if (
                        returnData.customer_payment_method === "Cambio" &&
                        returnData.new_products.length === 0
                      ) {
                        showSwal({
                          title: "Info",
                          text: "Si es un cambio, selecciona los productos nuevos",
                          icon: "info",
                        });
                        return;
                      }

                      if (
                        returnData.customer_payment_method ===
                        "Credito en tienda"
                      ) {
                        showSwal({
                          title: "Información",
                          text: 'Para crédito en tienda, usa el botón "Ir a Crear GiftCard" arriba.',
                          icon: "info",
                        });

                        return;
                      }
                      setStep(3);
                    }}
                    disabled={returnData.returned_products.length === 0}
                    className="bg-blue-500 text-white px-8 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <span>Continuar</span>
                    <span>➡️</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: CONFIRMAR DEVOLUCIÓN */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                ✅ Confirmar Devolución
              </h3>

              {/* Resumen del recibo original */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-3">📄 Recibo Original</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID Recibo:</span>
                    <div className="font-medium">
                      {originalReceipt.id_receipt}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Cliente:</span>
                    <div className="font-medium">
                      {originalReceipt.buyer_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha:</span>
                    <div className="font-medium">
                      {new Date(originalReceipt.date).toLocaleDateString(
                        "es-CO"
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Original:</span>
                    <div className="font-medium text-blue-600">
                      ${originalReceipt.total_amount?.toLocaleString("es-CO")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos a devolver */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-3 text-red-800 flex items-center">
                  <span className="mr-2">📦</span>
                  Productos a Devolver
                </h4>
                <div className="space-y-2">
                  {returnData.returned_products.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-white rounded border text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-gray-600">
                          Cantidad: {item.quantity} | Motivo: {item.reason}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">
                          -$
                          {(item.unit_price * item.quantity).toLocaleString(
                            "es-CO"
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-red-800">Total a devolver:</span>
                      <span className="text-red-600">
                        -$
                        {calculateTotals().totalReturned.toLocaleString(
                          "es-CO"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos nuevos si es cambio */}
              {returnData.customer_payment_method === "Cambio" &&
                returnData.new_products.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-3 text-purple-800 flex items-center">
                      <span className="mr-2">🔄</span>
                      Productos Nuevos (Cambio)
                    </h4>
                    <div className="space-y-2">
                      {returnData.new_products.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-white rounded border text-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {item.product_name}
                            </div>
                            <div className="text-gray-600">
                              Cantidad: {item.quantity} | Código:{" "}
                              {item.id_product}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-purple-600">
                              +$
                              {(item.unit_price * item.quantity).toLocaleString(
                                "es-CO"
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-purple-800">
                            Total productos nuevos:
                          </span>
                          <span className="text-purple-600">
                            +$
                            {calculateTotals().totalNewPurchase.toLocaleString(
                              "es-CO"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Información del cajero */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-2 text-blue-800">
                  👤 Información del Cajero
                </h4>
                <div className="text-sm text-blue-700">
                  <p>
                    <strong>Documento:</strong> {cashierDocument}
                  </p>
                  <p>
                    <strong>Fecha de procesamiento:</strong>{" "}
                    {new Date().toLocaleString("es-CO")}
                  </p>
                </div>
              </div>

              {/* Comentarios */}
              {returnData.reason && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">📝 Comentarios</h4>
                  <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                    {returnData.reason}
                  </div>
                </div>
              )}

              {/* Resumen financiero */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-3">💰 Resumen Financiero</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total del recibo original:</span>
                    <span className="font-medium">
                      ${originalReceipt.total_amount?.toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Monto a devolver:</span>
                    <span className="font-medium">
                      -$
                      {calculateTotals().totalReturned.toLocaleString("es-CO")}
                    </span>
                  </div>
                  {returnData.customer_payment_method === "Cambio" &&
                    returnData.new_products.length > 0 && (
                      <>
                        <div className="flex justify-between text-purple-600">
                          <span>Monto productos nuevos:</span>
                          <span className="font-medium">
                            +$
                            {calculateTotals().totalNewPurchase.toLocaleString(
                              "es-CO"
                            )}
                          </span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Balance final:</span>
                            <span
                              className={`${
                                calculateTotals().difference === 0
                                  ? "text-gray-600"
                                  : calculateTotals().difference > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {calculateTotals().difference === 0
                                ? "$0 - Exacto"
                                : calculateTotals().difference > 0
                                ? `Cliente debe: $${calculateTotals().difference.toLocaleString(
                                    "es-CO"
                                  )}`
                                : `A favor cliente: $${Math.abs(
                                    calculateTotals().difference
                                  ).toLocaleString("es-CO")}`}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                </div>
              </div>

              {/* Confirmación requerida */}
              <div className="mb-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" id="confirmReturn" />
                  <div className="text-sm">
                    <div className="font-medium">
                      Confirmo que he verificado:
                    </div>
                    <ul className="text-gray-600 mt-1 space-y-1">
                      <li>✓ La identidad del cliente</li>
                      <li>✓ El estado de los productos a devolver</li>
                      <li>✓ La información del recibo original</li>
                      <li>✓ El método de reembolso seleccionado</li>
                      {returnData.customer_payment_method === "Cambio" && (
                        <li>
                          ✓ Los productos de cambio y su diferencia de precio
                        </li>
                      )}
                    </ul>
                  </div>
                </label>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep(2)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <span>⬅️</span>
                  <span>Volver a Editar</span>
                </button>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm"
                  >
                    🔄 Empezar de Nuevo
                  </button>

                  {/* ✅ BOTÓN PRINCIPAL CORREGIDO */}
                  <button
                    onClick={() => {
                      const checkbox = document.getElementById("confirmReturn");
                      if (!checkbox.checked) {
                        showSwal({
                          title: "Error",
                          text: "Debes confirmar que has verificado toda la información",
                          icon: "error",
                        });

                        return;
                      }

                      // ✅ VALIDAR CASOS ESPECIALES ANTES DE PROCESAR
                      if (
                        returnData.customer_payment_method ===
                        "Credito en tienda"
                      ) {
                        showSwal({
                          title: "Información",
                          text: 'Para crédito en tienda, usa el botón "Ir a Crear GiftCard" en el paso anterior.',
                          icon: "info",
                        });
                        return;
                      }

                      if (
                        returnData.customer_payment_method === "Cambio" &&
                        calculateTotals().difference < 0
                      ) {
                        showSwal({
                          title: "Información",
                          text: 'Para crédito en tienda, usa el botón "Ir a Crear GiftCard" arriba.',
                          icon: "info",
                        });
                        return;
                      }

                      // ✅ USAR LA NUEVA FUNCIÓN
                      handleProcessReturnWithDifference();
                    }}
                    disabled={loading}
                    className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center space-x-2 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <span>✅</span>
                        <span>Procesar Devolución</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ PASO 4: RESULTADO */}
          {step === 4 && <ResultStep />}
        </div>
      </div>
    </>
  );
};
export default ReturnManagement;
