import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchOrdersByIdOrder, sendInvoice } from "../../Redux/Actions/actions"; // Ajusta la ruta según tu estructura
import numeroALetrasConDecimales from '../Taxxa/options/numeroALetras';
import paymentMethods from "./options/paymentMethods";
import OrdenesPendientes from "./OrdenesPendientes";

const Invoice = () => {
  const location = useLocation();
  const buyer = location.state?.buyer || {};
  const dispatch = useDispatch();
  const order = useSelector((state) => state.orderById.order);
  const orderLoading = useSelector((state) => state.orderById.loading);
  const orderError = useSelector((state) => state.orderById.error);

  const getCurrentDateTime = () => new Date().toISOString().slice(0, 16);
  const getCurrentDate = () => new Date().toISOString().slice(0, 10);

  const [orderId, setOrderId] = useState(""); // Para capturar el número de orden
  const { loading, success, error } = useSelector((state) => state.invoice);
  
  const [invoiceData, setInvoiceData] = useState({
    // Datos iniciales de la factura
    wVersionUBL: "2.1",
    wenvironment: "test",
    jDocument: {
      wdocumenttype: "Invoice",
      wdocumenttypecode: "01",
      scustomizationid: "10",
      wcurrency: "COP",
      sdocumentprefix: "",
      sdocumentsuffix: null,
      tissuedate: getCurrentDateTime(),
      tduedate: getCurrentDate(),
      wpaymentmeans: 1,
      wpaymentmethod: "10",
      nlineextensionamount: "", //Valor Bruto antes de tributos
      ntaxexclusiveamount: "", //Total de Valor Bruto más tributos
      ntaxinclusiveamount: "",
      npayableamount: "",
      snotes: "",
      snotetop: "",
      sorderreference: "",
      jextrainfo: {
        ntotalinvoicepayment: "",
        stotalinvoicewords: "",
        iitemscount: "",
      },
      jdocumentitems: [],
      
    },
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleChange = (e, path) => {
    const keys = path.split(".");
    const value = e.target.value;
    setInvoiceData((prevState) => {
      let obj = { ...prevState };
      let ref = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return obj;
    });
  };

  const handleFetchOrder = () => {
    if (orderId) {
      dispatch(fetchOrdersByIdOrder(orderId));
    }
  };

  useEffect(() => {
    if (order && Array.isArray(order.products)) {
      console.log("Datos de la orden recibidos:", order);
  
      const products = order.products.reduce((acc, product, index) => {
        const priceWithoutTax = parseFloat((product.price / 1.19).toFixed(2)); // Convertimos a número
        const taxAmount = parseFloat((product.price - priceWithoutTax).toFixed(2));
  
        acc[index] = {
          jextrainfo: {
            sbarcode: product.codigoBarra,
          },
          sdescription: product.description,
          wunitcode: "und",
          sstandarditemidentification: product.codigoBarra,
          sstandardidentificationcode: "999",
          nunitprice: priceWithoutTax, // Valor numérico
          nusertotal: parseFloat((priceWithoutTax * order.quantity).toFixed(2)), // Valor numérico
          nquantity: parseFloat(order.quantity.toFixed(2)), // Valor numérico
          jtax: {
            jiva: {
              nrate: 19,
              sname: "IVA",
              namount: parseFloat((taxAmount * order.quantity).toFixed(2)), // Valor numérico
              nbaseamount: parseFloat((priceWithoutTax * order.quantity).toFixed(2)), // Valor numérico
            },
          },
        };
  
        return acc;
      }, {});
  
      const totalAmountWithoutTax = order.products.reduce((total, product) => {
        const priceWithoutTax = product.price / 1.19;
        return total + priceWithoutTax * order.quantity;
      }, 0);
  
      const totalTaxAmount = order.products.reduce((total, product) => {
        const priceWithoutTax = product.price / 1.19;
        const taxAmount = product.price - priceWithoutTax;
        return total + taxAmount * order.quantity;
      }, 0);
  
      const totalPayableAmount = totalAmountWithoutTax + totalTaxAmount;
      const stotalinvoicewords = numeroALetrasConDecimales(totalPayableAmount); // Generar el texto en letras
  
      setInvoiceData({
        wVersionUBL: "2.1",
        wenvironment: "test",
        jDocument: {
          wdocumenttype: "Invoice",
          wdocumenttypecode: "01",
          scustomizationid: "10",
          wcurrency: "COP",
          sdocumentprefix: "",
          sdocumentsuffix: null,
          tissuedate: new Date().toISOString(), // Fecha actual
          tduedate: new Date().toISOString().split("T")[0], // Solo la fecha
          wpaymentmeans: 1,
          wpaymentmethod: "10",
          nlineextensionamount: parseFloat(totalAmountWithoutTax.toFixed(2)), // Valor numérico
          ntaxexclusiveamount: parseFloat(totalAmountWithoutTax.toFixed(2)), // Valor numérico
          ntaxinclusiveamount: parseFloat(totalPayableAmount.toFixed(2)), // Valor numérico
          npayableamount: parseFloat(totalPayableAmount.toFixed(2)), // Valor numérico
          sorderreference: orderId,
          snotes: "",
          snotetop: "",
          jextrainfo: {
            ntotalinvoicepayment: parseFloat(totalPayableAmount.toFixed(2)), // Valor numérico
            stotalinvoicewords, // Texto en letras
            iitemscount: order.products.length.toString(), // Enviamos como string si es necesario
          },
          jdocumentitems: products, // Productos en formato objeto
          jbuyer: buyer,
        },
      });
    }
  }, [order]);
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(sendInvoice(invoiceData));
    console.log("Factura enviada:", invoiceData);
    // Aquí puedes llamar al método `sendInvoice` del `TaxxaService`
  };

  return (
    <div className="p-4 pt-16">
      <OrdenesPendientes />
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
        {orderError && <p className="text-red-500">{error}</p>}
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-gray-100 rounded-md shadow-md mt-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div>
            <label className="block mb-2">Prefijo del documento:</label>
            <input
              type="text"
              value={invoiceData.jDocument.sdocumentprefix}
              onChange={(e) => handleChange(e, "jDocument.sdocumentprefix")}
              className="border p-2 w-full"
              placeholder="Colocar el prefijo activo en DIAN, mínimo 1 carácter, máximo 4"
            />
          </div>

          <div>
            <label className="block mb-2">Fecha de emisión:</label>
            <input
              type="datetime-local"
              value={invoiceData.jDocument.tissuedate}
              onChange={(e) => handleChange(e, "jDocument.tissuedate")}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-2">Fecha de vencimiento:</label>
            <input
              type="date"
              value={invoiceData.jDocument.tduedate}
              onChange={(e) => handleChange(e, "jDocument.tduedate")}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-2">Método de pago:</label>
            <select
              value={invoiceData.jDocument.wpaymentmeans}
              onChange={(e) => handleChange(e, "jDocument.wpaymentmeans")}
              className="border p-2 w-full"
            >
              <option value={1}>Contado</option>
              <option value={2}>Crédito</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Método de pago:</label>
            <select
              value={invoiceData.jDocument.wpaymentmethod}
              onChange={(e) => handleChange(e, "jDocument.wpaymentmethod")}
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
              type="text"
              value={invoiceData.jDocument.nlineextensionamount}
              onChange={(e) =>
                handleChange(e, "jDocument.nlineextensionamount")
              }
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-2">
              Total Valor Bruto antes de tributos:
            </label>
            <input
              type="text"
              value={invoiceData.jDocument.ntaxexclusiveamount}
              onChange={(e) => handleChange(e, "jDocument.ntaxexclusiveamount")}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-2">
              Total Valor Bruto antes de tributos:
            </label>
            <input
              type="text"
              value={invoiceData.jDocument.ntaxinclusiveamount}
              onChange={(e) => handleChange(e, "jDocument.ntaxinclusiveamount")}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-2">
              Monto Total:
            </label>
            <input
              type="text"
              value={invoiceData.jDocument.npayableamount}
              onChange={(e) => handleChange(e, "jDocument.npayableamount")}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-2">
              Monto en Letras:
            </label>
            <input
              type="text"
              value={invoiceData.jDocument.jextrainfo.stotalinvoicewords}
              onChange={(e) => handleChange(e, "jDocument.jextrainfo.stotalinvoicewords")}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-2">
              Items:
            </label>
            <input
              type="text"
              value={invoiceData.jDocument.jextrainfo.iitemscount}
              onChange={(e) => handleChange(e, "jDocument.jextrainfo.stotalinvoicewords")}
              className="border p-2 w-full"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 mt-4 rounded hover:bg-blue-600"
        >
          Enviar factura
        </button>

      </form>
      <div>{success ? "Invoice sent successfully!" : "Send an invoice"}</div>
    </div>
  );
};

export default Invoice;
