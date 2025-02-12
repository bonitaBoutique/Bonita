const { SellerData, User, Invoice,  OrderDetail } = require('../../data');
const { generateToken, sendDocument } = require('./taxxaUtils'); 

generateToken();

const createInvoice = async (req, res) => {
  const { id_orderDetail, invoiceData, sellerId } = req.body;

  try {
      // Validar que el id_orderDetail existe en la petición
      if (!id_orderDetail) {
          return res.status(400).json({ message: "ID de la orden requerido" });
      }

      // Buscar la orden por su ID
      const orderDetail = await OrderDetail.findOne({ where: { id_orderDetail } });

      // Validar que la orden exista
      if (!orderDetail) {
          return res.status(404).json({ message: "Orden no encontrada" });
      }

      // Validar que la orden no esté ya facturada
      if (orderDetail.status === "facturada") {
          return res.status(400).json({ message: "La orden ya está facturada" });
      }

      // Obtener los datos del vendedor (asumiendo que tienes el ID del vendedor en orderDetail)
      const sellerData = await SellerData.findOne({ where: { sdocno: sellerId } });
      if (!sellerData) {
          return res.status(404).json({ message: "Datos del vendedor no encontrados" });
      }

      // Obtener los datos del comprador (asumiendo que tienes el ID del comprador en orderDetail)
      const userData = await User.findOne({ where: { n_document: orderDetail.n_document  } }); // Ajusta esto según tu modelo

      if (!userData) {
          return res.status(404).json({ message: "Datos del comprador no encontrados" });
      }

      // Construir el objeto jBuyer (puedes necesitar ajustar esto según tus campos)
      const jBuyer = {
          wlegalorganizationtype: userData.wlegalorganizationtype || "person", // Valor por defecto
          scostumername: userData.scostumername || "CONSUMIDOR FINAL",
          stributaryidentificationkey: userData.stributaryidentificationkey || "ZZ",
          sfiscalresponsibilities: userData.sfiscalresponsibilities || "R-99-PN",
          sfiscalregime: userData.sfiscalregime || "48",
          jpartylegalentity: {
              wdoctype: userData.wdoctype || "CC",
              sdocno: userData.n_document,
              scorporateregistrationschemename: userData.scostumername || "CONSUMIDOR FINAL"
          },
          jcontact: {
              scontactperson: userData.first_name + " " + userData.last_name || "CONSUMIDOR FINAL",
              selectronicmail: userData.email || "xxxxxxxxxxxxxxxxxxxxxx",
              stelephone: userData.phone || "0000000"
          }
      };

      // Construir el objeto jDocument (ajusta esto según tus campos y el formato que necesita Taxxa)
      const jDocument = {
          wdocumenttype: "Invoice",
          wdocumenttypecode: "01",
          scustomizationid: "10",
          wcurrency: "COP",
          sdocumentprefix: "SETP",
          sdocumentsuffix: null,
          tissuedate: new Date().toISOString().slice(0, 19).replace('T', ' '), // Formato de fecha
          tduedate: new Date().toISOString().slice(0, 10), // Formato de fecha
          wpaymentmeans: 1,
          wpaymentmethod: "10",
          nlineextensionamount: invoiceData.nlineextensionamount, // Ajusta esto
          ntaxexclusiveamount: invoiceData.ntaxexclusiveamount, // Ajusta esto
          ntaxinclusiveamount: invoiceData.ntaxinclusiveamount, // Ajusta esto
          npayableamount: invoiceData.npayableamount, // Ajusta esto
          sorderreference: id_orderDetail,
          tdatereference: new Date().toISOString().slice(0, 10),
          jextrainfo: {
              ntotalinvoicepayment: invoiceData.ntotalinvoicepayment, // Ajusta esto
              stotalinvoicewords: invoiceData.stotalinvoicewords, // Ajusta esto
              iitemscount: invoiceData.iitemscount // Ajusta esto
          },
          jdocumentitems: invoiceData.jdocumentitems ? invoiceData.jdocumentitems.reduce((obj, item, index) => { // Verifica que invoiceData.jdocumentitems tenga un valor definido
            obj[index] = item;
            return obj;
          }, {}) : {}, // Ajusta esto (asegúrate de que el formato sea correcto)
         jseller: {
              wlegalorganizationtype: "person",
              sfiscalresponsibilities: sellerData.sfiscalresponsibilities,
              sdocno: sellerData.sdocno,
              sdoctype: sellerData.sdoctype,
              ssellername: sellerData.ssellername,
              ssellerbrand: sellerData.ssellerbrand,
              scontactperson: sellerData.scontactperson,
              saddresszip: sellerData.saddresszip,
              wdepartmentcode: sellerData.wdepartmentcode,
              wtowncode: "501021",
              scityname: sellerData.scityname,
              jcontact: {
                  selectronicmail: sellerData.contact_selectronicmail,
                  jregistrationaddress: {
                      wdepartmentcode: sellerData.registration_wdepartmentcode,
                      scityname: sellerData.registration_scityname,
                      saddressline1: sellerData.registration_saddressline1,
                      scountrycode: sellerData.registration_scountrycode,
                      wprovincecode: sellerData.registration_wprovincecode,
                      szip: sellerData.registration_szip,
                      sdepartmentname: sellerData.registration_sdepartmentname
                  }
              }
          }, // Convertir a JSON
          jbuyer: jBuyer
      };

      // Construir el body para la API de Taxxa
      const taxxaBody = {
          sMethod: "classTaxxa.fjDocumentAdd",
          jParams: {
              wVersionUBL: 2.1,
              wenvironment: "test",
              jDocument: jDocument
          }
      };

      const jApi = {
        sMethod: "classTaxxa.fjDocumentAdd",
        jParams: {
            wVersionUBL: 2.1,
            wenvironment: "test",
            jDocument: jDocument
        }
      };

   

      console.log("taxxaBody:", JSON.stringify(taxxaBody, null, 2)); // Imprime el objeto taxxaBody en la consola
  
      // Enviar la factura a Taxxa usando la función sendDocument
      let taxxaResponse;
      try {
          taxxaResponse = await sendDocument(taxxaBody);

          if (taxxaResponse && taxxaResponse.rerror === 0) {
              // La factura se envió correctamente
              console.log("Factura enviada a Taxxa con éxito:", taxxaResponse);

              // Actualizar el estado de la orden
              await orderDetail.update({ status: "facturada" });

              res.status(200).json({ message: "Factura creada y enviada con éxito", taxxaResponse });
          }
        } catch (error) {
            console.error("Error al enviar la factura a Taxxa:", error);
            // Access the response object from the error
            console.error("Error response:", error.response);
            // Send the entire smessage object in the error response
            res.status(500).json({ 
                message: "Error al enviar la factura a Taxxa", 
                error: error.response?.data?.smessage 
            });
        }

    } catch (error) {
        console.error(error);
         // Imprimir el mensaje de error completo
        console.error("Error completo:", error);
        res.status(500).json({ message: "Error al crear la factura", error: error.message });
    }
};

module.exports = {
  createInvoice
};