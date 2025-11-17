import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../Config";
import {
  fetchOrdersByIdOrder,
  sendInvoice,
  fetchSellerData, // Agregar esta importación
} from "../../Redux/Actions/actions";
import numeroALetrasConDecimales from "../Taxxa/options/numeroALetras";
import paymentMethods from "./options/paymentMethods";
import OrdenesPendientes from "./OrdenesPendientes";

const Invoice = () => {
  const sellerId = "901832769";
  const location = useLocation();
  const navigate = useNavigate(); // ✅ Para navegar de vuelta
  const buyer = location.state?.buyer || {};
  const orderFromLocation = location.state?.order || null; // ✅ Capturar orden desde location.state
  const dispatch = useDispatch();
  const order = useSelector((state) => state.orderById.order);
  const orderLoading = useSelector((state) => state.orderById.loading);
  const orderError = useSelector((state) => state.orderById.error);
  const sellerData = useSelector((state) => state.sellerData.data);
  const sellerLoading = useSelector((state) => state.sellerData.loading);
  const sellerError = useSelector((state) => state.sellerData.error);

  const [orderId, setOrderId] = useState("");
  const [orderPreloaded, setOrderPreloaded] = useState(false); // ✅ Flag para saber si la orden ya fue precargada
  const {
    loading: invoiceLoading,
    success,
    error: invoiceError,
  } = useSelector((state) => state.invoice);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [jDocumentData, setJDocumentData] = useState({
    // Cambia invoiceData a jDocumentData
    wVersionUBL: "2.1",
    wenvironment: "test",
    wdocumenttype: "Invoice",
    wdocumenttypecode: "01",
    scustomizationid: "10",
    wcurrency: "COP",
    sdocumentprefix: "FVB",
    sdocumentsuffix: 2,
    tissuedate: new Date().toISOString(),
    tduedate: new Date().toISOString().split("T")[0],
    wpaymentmeans: 1,
    wpaymentmethod: "10",
    nlineextensionamount: 0,
    ntaxexclusiveamount: 0,
    ntaxinclusiveamount: 0,
    npayableamount: 0,
    sorderreference: "",
    snotes: "",
    snotetop: "",
    jextrainfo: {
      ntotalinvoicepayment: 0,
      stotalinvoicewords: "",
      iitemscount: "0",
    },
    jdocumentitems: [],
    jbuyer: buyer,
  });

  useEffect(() => {
    if (sellerId && !sellerData) {
      console.log("🔄 Cargando datos del vendedor inicial...");
      dispatch(fetchSellerData(sellerId));
    }
  }, [dispatch, sellerId, sellerData]);

  // ✅ NUEVO: Actualizar jbuyer cuando cambia desde location.state
  useEffect(() => {
    if (buyer && Object.keys(buyer).length > 0) {
      console.log('👤 [Invoice] Actualizando buyer desde navegación:', buyer);
      setJDocumentData((prev) => ({
        ...prev,
        jbuyer: buyer
      }));
    }
  }, [buyer]);

  // ✅ NUEVO: Cargar orden automáticamente si viene desde el modal de facturación
  useEffect(() => {
    if (orderFromLocation && orderFromLocation.id_orderDetail && !orderPreloaded) {
      console.log('📦 [Invoice] Orden precargada desde navegación:', orderFromLocation);
      setOrderId(orderFromLocation.id_orderDetail);
      dispatch(fetchOrdersByIdOrder(orderFromLocation.id_orderDetail));
      setOrderPreloaded(true); // Marcar como cargada
    }
  }, [orderFromLocation, dispatch, orderPreloaded]);

  const handleSelectOrder = (selectedOrderId) => {
    setOrderId(selectedOrderId); // Actualizar el estado con el ID de la orden seleccionada
  };
  

  useEffect(() => {
    const fetchLastInvoiceNumber = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/invoice/lastNumber`);

        if (response.data.success) {
          // Convert string to number
          const nextNumber = parseInt(response.data.nextInvoiceNumber);

          setJDocumentData((prev) => ({
            ...prev,
            sdocumentsuffix: nextNumber, // Store as number
          }));
        } else {
          // Use 2 as default number
          setJDocumentData((prev) => ({
            ...prev,
            sdocumentsuffix: nextNumber,
          }));
        }
      } catch (error) {
        console.error("Error obteniendo número de factura:", error);
        setJDocumentData((prev) => ({
          ...prev,
          sdocumentsuffix: nextNumber,
        }));
      }
    };

    fetchLastInvoiceNumber();
  }, []);
  

  useEffect(() => {
    if (order && order.amount) {
      // ✅ PRIORIZAR: Usar total_amount del recibo si existe (con descuento aplicado), sino usar amount de la orden
      const amountToUse = order.receipt_info?.total_amount || order.amount;
      console.log('💰 [Invoice] Usando monto:', {
        orderAmount: order.amount,
        receiptAmount: order.receipt_info?.total_amount,
        amountToUse,
        hasDiscount: order.amount !== amountToUse
      });

      let totalAmountWithoutTax = 0;
      let totalTaxAmount = 0;
      let totalAmount = 0;

      // Cantidad total a repartir entre productos
      let remainingQuantity = order.quantity;

      const productsData = order.products.map((product, index) => {
        // Calcular el precio unitario sin IVA y el IVA por unidad
        const priceWithoutTax = product.priceSell / 1.19;
        const taxAmount = product.priceSell - priceWithoutTax;

        // Redondeo final para evitar errores de precisión
        const formattedPriceWithoutTax = parseFloat(priceWithoutTax.toFixed(2));
        const formattedTaxAmount = parseFloat(taxAmount.toFixed(2));

        // Cantidad proporcional por producto
        const isLastProduct = index === order.products.length - 1;
        const quantityPerProduct = isLastProduct
          ? remainingQuantity
          : Math.floor(order.quantity / order.products.length);
        remainingQuantity -= quantityPerProduct;

        // Calcular totales por producto
        const productTotalWithoutTax =
          formattedPriceWithoutTax * quantityPerProduct;
        const productTotalTax = formattedTaxAmount * quantityPerProduct;
        const productTotal = product.priceSell * quantityPerProduct;

        // Acumular totales
        totalAmountWithoutTax += productTotalWithoutTax;
        totalTaxAmount += productTotalTax;
        totalAmount += productTotal;

        return {
          jextrainfo: {
            sbarcode: product.codigoBarra,
          },
          sdescription: product.description,
          wunitcode: "und",
          sstandarditemidentification: product.codigoBarra,
          sstandardidentificationcode: "999",
          nunitprice: formattedPriceWithoutTax,
          nusertotal: parseFloat(productTotalWithoutTax.toFixed(2)),
          nquantity: quantityPerProduct, // Cantidad calculada por producto
          jtax: {
            jiva: {
              nrate: 19,
              sname: "IVA",
              namount: parseFloat(productTotalTax.toFixed(2)),
              nbaseamount: parseFloat(productTotalWithoutTax.toFixed(2)),
            },
          },
        };
      });

      // Actualizar estado con los valores calculados
      setJDocumentData((prevJDocumentData) => ({
        ...prevJDocumentData,
        nlineextensionamount: parseFloat(totalAmountWithoutTax.toFixed(2)),
        ntaxexclusiveamount: parseFloat(totalAmountWithoutTax.toFixed(2)),
        ntaxinclusiveamount: parseFloat(totalAmount.toFixed(2)),
        npayableamount: parseFloat(totalAmount.toFixed(2)),
        jextrainfo: {
          ntotalinvoicepayment: parseFloat(totalAmount.toFixed(2)),
          stotalinvoicewords: numeroALetrasConDecimales(totalAmount),
          iitemscount: order.products.length.toString(), // Número total de productos
        },
        jdocumentitems: productsData,
      }));
    }
  }, [order]);

  const handleChange = (e, path) => {
    const keys = path.split(".");
    const value = e.target.value;
    setJDocumentData((prevState) => {
      // Cambia setInvoiceData a setJDocumentData
      let obj = { ...prevState };
      let ref = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return obj;
    });
  };

  // ✅ NUEVA FUNCIÓN: Manejar cambio manual del monto y recalcular todo
  const handleAmountChange = (e) => {
    const newTotalWithTax = parseFloat(e.target.value) || 0;
    
    console.log('💰 [Invoice] Recalculando valores con nuevo monto:', newTotalWithTax);
    
    // Calcular valores base (asumiendo IVA del 19%)
    const totalWithoutTax = newTotalWithTax / 1.19;
    const totalTax = newTotalWithTax - totalWithoutTax;
    
    // Si hay productos, redistribuir el monto entre ellos proporcionalmente
    let updatedItems = [...jDocumentData.jdocumentitems];
    
    if (updatedItems.length > 0 && order && order.products) {
      // Calcular la proporción de cada producto
      const currentTotal = jDocumentData.ntaxinclusiveamount || 1; // Evitar división por 0
      const scaleFactor = newTotalWithTax / currentTotal;
      
      let accumulatedWithoutTax = 0;
      let accumulatedTax = 0;
      
      updatedItems = updatedItems.map((item, index) => {
        const isLastItem = index === updatedItems.length - 1;
        
        if (isLastItem) {
          // Para el último item, usar el residuo para evitar errores de redondeo
          const itemTotalWithoutTax = totalWithoutTax - accumulatedWithoutTax;
          const itemTax = totalTax - accumulatedTax;
          
          return {
            ...item,
            nusertotal: parseFloat(itemTotalWithoutTax.toFixed(2)),
            nunitprice: parseFloat((itemTotalWithoutTax / item.nquantity).toFixed(2)),
            jtax: {
              jiva: {
                ...item.jtax.jiva,
                namount: parseFloat(itemTax.toFixed(2)),
                nbaseamount: parseFloat(itemTotalWithoutTax.toFixed(2))
              }
            }
          };
        } else {
          // Para los demás items, escalar proporcionalmente
          const itemTotalWithoutTax = (item.nusertotal || 0) * scaleFactor;
          const itemTax = (item.jtax?.jiva?.namount || 0) * scaleFactor;
          
          accumulatedWithoutTax += itemTotalWithoutTax;
          accumulatedTax += itemTax;
          
          return {
            ...item,
            nusertotal: parseFloat(itemTotalWithoutTax.toFixed(2)),
            nunitprice: parseFloat((itemTotalWithoutTax / item.nquantity).toFixed(2)),
            jtax: {
              jiva: {
                ...item.jtax.jiva,
                namount: parseFloat(itemTax.toFixed(2)),
                nbaseamount: parseFloat(itemTotalWithoutTax.toFixed(2))
              }
            }
          };
        }
      });
    }
    
    // Actualizar todos los valores calculados
    setJDocumentData((prev) => ({
      ...prev,
      nlineextensionamount: parseFloat(totalWithoutTax.toFixed(2)),
      ntaxexclusiveamount: parseFloat(totalWithoutTax.toFixed(2)),
      ntaxinclusiveamount: parseFloat(newTotalWithTax.toFixed(2)),
      npayableamount: parseFloat(newTotalWithTax.toFixed(2)),
      jextrainfo: {
        ...prev.jextrainfo,
        ntotalinvoicepayment: parseFloat(newTotalWithTax.toFixed(2)),
        stotalinvoicewords: numeroALetrasConDecimales(newTotalWithTax)
      },
      jdocumentitems: updatedItems
    }));
    
    console.log('✅ [Invoice] Valores recalculados:', {
      totalWithoutTax: parseFloat(totalWithoutTax.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalWithTax: parseFloat(newTotalWithTax.toFixed(2)),
      itemsUpdated: updatedItems.length
    });
  };

  const handleFetchOrder = async () => {
    if (!orderId) return;
    try {
      await dispatch(fetchOrdersByIdOrder(orderId));
    } catch (err) {
      console.error("Error fetching order:", err);
    }
  };
  const resetForm = () => {
    setJDocumentData({
      wVersionUBL: "2.1",
      wenvironment: "test",
      wdocumenttype: "Invoice",
      wdocumenttypecode: "01",
      scustomizationid: "10",
      wcurrency: "COP",
      sdocumentprefix: "FVB",
      sdocumentsuffix: 4,
      tissuedate: new Date().toISOString(),
      tduedate: new Date().toISOString().split("T")[0],
      wpaymentmeans: 1,
      wpaymentmethod: "10",
      nlineextensionamount: 0,
      ntaxexclusiveamount: 0,
      ntaxinclusiveamount: 0,
      npayableamount: 0,
      sorderreference: "",
      snotes: "",
      snotetop: "",
      jextrainfo: {
        ntotalinvoicepayment: 0,
        stotalinvoicewords: "",
        iitemscount: "0",
      },
      jdocumentitems: [],
      jbuyer: buyer,
    });
    setOrderId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    console.log("=== DEBUG INFORMACIÓN ===");
    console.log("1. Estado actual de order:", order);
    console.log("2. Estado actual de sellerData:", sellerData);
    console.log("3. ID de la orden:", order?.id_orderDetail);

    try {
      // Primero verificar si hay datos del vendedor
      if (!sellerData) {
        console.log("⏳ Esperando datos del vendedor...");
        await dispatch(fetchSellerData(sellerId));
        // Esperar un momento para que el estado se actualice
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verificar nuevamente los datos del vendedor
        if (!sellerData) {
          throw new Error("No se pudieron cargar los datos del vendedor");
        }
      }

      // Validaciones
      if (!order) {
        throw new Error("No hay orden seleccionada");
      }

      if (!order.id_orderDetail) {
        throw new Error("ID de orden no válido");
      }

      if (
        !jDocumentData.sdocumentsuffix ||
        typeof jDocumentData.sdocumentsuffix !== "number"
      ) {
        throw new Error("Número de factura no válido");
      }

      console.log("✅ Todas las validaciones pasaron");

      const jDocumentDataWithOrderId = {
        ...jDocumentData,
        sorderreference: order.id_orderDetail,
        sdocumentsuffix: jDocumentData.sdocumentsuffix,
        jseller: {
          wlegalorganizationtype: sellerData.wlegalorganizationtype || "",
          sfiscalresponsibilities: sellerData.sfiscalresponsibilities || "",
          sdocno: sellerData.sdocno || "",
          sdoctype: sellerData.sdoctype || "",
          ssellername: sellerData.ssellername || "",
          ssellerbrand: sellerData.ssellerbrand || "",
          scontactperson: sellerData.scontactperson || "",
          saddresszip: sellerData.saddresszip || "",
          wdepartmentcode: sellerData.wdepartmentcode || "",
          wtowncode: sellerData.wtowncode || "",
          scityname: sellerData.scityname || "",
          jcontact: {
            selectronicmail: sellerData.jcontact?.selectronicmail || "",
            jregistrationaddress: {
              wdepartmentcode:
                sellerData.jcontact?.jregistrationaddress?.wdepartmentcode ||
                "",
              scityname:
                sellerData.jcontact?.jregistrationaddress?.scityname || "",
              saddressline1:
                sellerData.jcontact?.jregistrationaddress?.saddressline1 || "",
              scountrycode:
                sellerData.jcontact?.jregistrationaddress?.scountrycode || "",
              wprovincecode:
                sellerData.jcontact?.jregistrationaddress?.wprovincecode || "",
              szip: sellerData.jcontact?.jregistrationaddress?.szip || "",
              sdepartmentname:
                sellerData.jcontact?.jregistrationaddress?.sdepartmentname ||
                "",
            },
          },
        },
      };

      console.log(
        "5. Datos completos a enviar:",
        JSON.stringify(jDocumentDataWithOrderId, null, 2)
      );

      const invoiceDataToSend = {
        invoiceData: jDocumentDataWithOrderId,
        sellerId: sellerId,
        overrideSuffix: jDocumentDataWithOrderId.sdocumentsuffix,
      };

      const response = await dispatch(sendInvoice(invoiceDataToSend));
      console.log("✅ Factura enviada con éxito:", response);
      
      // ✅ Mostrar mensaje de éxito
      alert("✅ Factura enviada exitosamente");
      
      // ✅ Resetear formulario
      resetForm();
      
      // ✅ Resetear estado de orden precargada
      setOrderPreloaded(false);
      
      // ✅ Navegar de vuelta al listado de órdenes pendientes
      navigate("/panel/facturacion");
      
    } catch (err) {
      console.error("❌ Error:", err);
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 pt-16">
      {/* Indicadores de estado del vendedor */}
      {sellerLoading && (
        <div className="text-blue-500 mb-4 p-3 bg-blue-50 rounded-md flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando datos del vendedor...
        </div>
      )}
      {sellerError && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-md flex items-center">
          <svg
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Error al cargar datos del vendedor: {sellerError}
        </div>
      )}

      {/* ✅ Solo mostrar el selector de órdenes si NO hay una orden precargada */}
      {!orderPreloaded && (
        <>
          <OrdenesPendientes filterType="facturablesPendientes" mode="invoice"  onSelectOrder={handleSelectOrder} />
          <div className="mb-4">
            <label className="block mb-2">Buscar Orden por ID:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="border p-2 w-full"
              />
              <button
                onClick={handleFetchOrder}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Buscar
              </button>
            </div>
            {orderLoading && <p>Cargando...</p>}
            {orderError && <p className="text-red-500">{orderError}</p>}
          </div>
        </>
      )}

      {/* ✅ Mostrar información de la orden cuando esté cargada */}
      {orderPreloaded && order && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                📦 Orden Seleccionada: #{order.id_orderDetail}
              </h3>
              <div className="text-sm text-gray-700">
                <p><strong>Cliente:</strong> {order.buyer_name || 'N/A'}</p>
                <p><strong>Monto:</strong> ${order.amount?.toLocaleString('es-CO')}</p>
                <p><strong>Productos:</strong> {order.products?.length || 0}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/panel/facturacion")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                title="Volver al listado de órdenes pendientes"
              >
                ← Volver
              </button>
              <button
                onClick={() => {
                  setOrderPreloaded(false);
                  setOrderId("");
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                title="Seleccionar otra orden"
              >
                🔄 Cambiar Orden
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-4 bg-gray-100 rounded-md shadow-md mt-4"
      >
        {/* ✅ Header del formulario con botón volver */}
        <div className="mb-6 pb-4 border-b border-gray-300 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            📄 Formulario de Factura
          </h2>
          <button
            type="button"
            onClick={() => navigate("/panel/facturacion")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Listado
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2">Prefijo del documento:</label>
            <input
              type="text"
              value={jDocumentData.sdocumentprefix} // Cambia invoiceData a jDocumentData
              onChange={(e) => handleChange(e, "sdocumentprefix")} // Cambia jDocument.sdocumentprefix a sdocumentprefix
              className="border p-2 w-full"
              placeholder="Colocar el prefijo activo en DIAN, mínimo 1 carácter, máximo 4"
            />
          </div>

          <div>
            <label className="block mb-2">Fecha de emisión:</label>
            <input
              type="date"
              value={jDocumentData.tissuedate} // Cambia invoiceData a jDocumentData
              onChange={(e) => handleChange(e, "tissuedate")} // Cambia jDocument.tissuedate a tissuedate
              className="border p-2 w-full"
            />
          </div>
          <div>
            <input
              type="number"
              value={jDocumentData.sdocumentsuffix} // Will display as number
              onChange={(e) => handleChange(e, "sdocumentsuffix")}
              className="border p-2 w-full"
            />
          </div>

          <div>
            <label className="block mb-2">Fecha de vencimiento:</label>
            <input
              type="date"
              value={jDocumentData.tduedate} // Cambia invoiceData a jDocumentData
              onChange={(e) => handleChange(e, "tduedate")} // Cambia jDocument.tduedate a tduedate
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-2">Método de pago:</label>
            <select
              value={jDocumentData.wpaymentmeans} // Cambia invoiceData a jDocumentData
              onChange={(e) => handleChange(e, "wpaymentmeans")} // Cambia jDocument.wpaymentmeans a wpaymentmeans
              className="border p-2 w-full"
            >
              <option value={1}>Contado</option>
              <option value={2}>Crédito</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Método de pago:</label>
            <select
              value={jDocumentData.wpaymentmethod} // Cambia invoiceData a jDocumentData
              onChange={(e) => handleChange(e, "wpaymentmethod")} // Cambia jDocument.wpaymentmethod a wpaymentmethod
              className="border p-2 w-full"
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Monto de la Orden:</label>
            <input
              type="number"
              step="0.01"
              value={jDocumentData.ntaxinclusiveamount} // ✅ Usar el monto TOTAL con impuestos
              onChange={handleAmountChange} // ✅ Usar la nueva función de recálculo
              className="border p-2 w-full bg-yellow-50 font-semibold"
              placeholder="Ingrese el monto total con IVA"
              title="Al cambiar este valor se recalcularán automáticamente todos los importes"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Este monto incluye IVA (19%). Los valores se recalcularán automáticamente.
            </p>
          </div>
          <div>
            <label className="block mb-2">
              Total Valor Bruto antes de tributos:
            </label>
            <input
              type="text"
              value={jDocumentData.nlineextensionamount} // ✅ Este es calculado automáticamente
              readOnly
              className="border p-2 w-full bg-gray-100 text-gray-600"
              title="Calculado automáticamente (Monto sin IVA)"
            />
          </div>
          <div>
            <label className="block mb-2">
              Total Valor Bruto antes de tributos:
            </label>
            <input
              type="text"
              value={jDocumentData.ntaxexclusiveamount} // ✅ Este es calculado automáticamente
              readOnly
              className="border p-2 w-full bg-gray-100 text-gray-600"
              title="Calculado automáticamente (Monto sin IVA)"
            />
          </div>
          <div>
            <label className="block mb-2">Monto Total:</label>
            <input
              type="text"
              value={jDocumentData.npayableamount} // ✅ Este es calculado automáticamente
              readOnly
              className="border p-2 w-full bg-gray-100 text-gray-600"
              title="Calculado automáticamente (Monto a pagar)"
            />
          </div>
          <div>
            <label className="block mb-2">Monto en Letras:</label>
            <input
              type="text"
              value={jDocumentData.jextrainfo.stotalinvoicewords} // ✅ Este es calculado automáticamente
              readOnly
              className="border p-2 w-full bg-gray-100 text-gray-600"
              title="Calculado automáticamente"
            />
          </div>
          <div>
            <label className="block mb-2">Items:</label>
            <input
              type="text"
              value={jDocumentData.jextrainfo.iitemscount} // Cambia invoiceData a jDocumentData
              onChange={(e) => handleChange(e, "jextrainfo.iitemscount")} // Cambia jDocument.jextrainfo.iitemscount a jextrainfo.iitemscount
              className="border p-2 w-full"
            />
          </div>
        </div>
        
        {/* ✅ Botones de acción */}
        <div className="mt-6 pt-4 border-t border-gray-300 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("¿Estás seguro de que deseas cancelar? Se perderán los cambios no guardados.")) {
                resetForm();
                navigate("/panel/facturacion");
              }
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-6 py-2 rounded font-medium transition-colors ${
              isLoading || !sellerData
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
            disabled={isLoading || !sellerData}
          >
            {isLoading
              ? "Enviando factura..."
              : !sellerData
              ? "Cargando datos del vendedor..."
              : "✅ Enviar Factura"}
          </button>
        </div>
      </form>
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      {success && (
        <p className="text-green-500 mt-2">Factura enviada con éxito!</p>
      )}
    </div>
  );
};

export default Invoice;
