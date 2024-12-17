import React, { useState } from "react";
import paymentMethods from "./options/paymentMethods"


const Invoice = () => {
    const getCurrentDateTime = () => {
        const now = new Date();
        return now.toISOString().slice(0, 16); 
      };

      const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().slice(0, 10); // Formato 'YYYY-MM-DD'
      };
  const [invoiceData, setInvoiceData] = useState({
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
      nlineextensionamount: "", //Total valor bruto, suma de los valores brutos de las líneas de la factura.
      ntaxexclusiveamount: "", //Total valor bruto, suma de los valores brutos de las líneas de la factura.
      ntaxinclusiveamount: "", //Total de Valor Bruto más tributos
      npayableamount: "",//Total de Valor Bruto más tributos
      snotes: "",
      snotetop: "", //  "IVA Régimen Común No somos Agentes de Retención de IVA No somos Grandes Contribuyentes Actividad Económica ICA 4520 9.66 X 1000",
      sorderreference: "", //puede ir o no
      jextrainfo: {
        ntotalinvoicepayment: "",  //Total de la factura despues de impuestos:
        stotalinvoicewords: "",  //Importe en letras de la factura
        iitemscount: "", //Contador del total de items de la factura, sumatoria de la cantidad de líneas no se la cantidad de items
        
      },
      jdocumentitems: [
        {
          jextrainfo: {
            sbarcode: "",
           
          },
          sdescription: "",
          wunitcode: "und",
          sstandarditemidentification: "",  //barcode
          sstandardidentificationcode: "999",
          nunitprice: "",
          nusertotal: "", //Valor total de los ITEMS ((Valor unitario * cantidad) +recargos)-Descuentos
          nquantity: "", //cantidad items
          jtax: {
            jiva: {
              nrate: 19,
              sname: "IVA",
              namount: "",
              nbaseamount: "", //Valor del impuesto
            },
          },
        },
      ],
    },
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Factura enviada:", invoiceData);
    // Aquí puedes llamar al método `sendInvoice` del `TaxxaService`
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-100 rounded-md shadow-md mt-40"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label className="block mb-2">Prefijo del documento:</label>
        <input
          type="text"
          value={invoiceData.jDocument.sdocumentprefix}
          onChange={(e) => handleChange(e, "jDocument.sdocumentprefix")}
          className="border p-2 w-full"
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
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 mt-4 rounded hover:bg-blue-600"
      >
        Enviar factura
      </button>
    </form>
  );
};

export default Invoice;
