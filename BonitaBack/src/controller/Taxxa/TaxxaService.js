const { SellerData, User, OrderDetail } = require('../../data');
const { generateToken, sendDocument } = require('./taxxaUtils');

const createInvoice = async (req, res) => {
  try {
    console.log('=== Iniciando proceso de facturación ===');
    console.log('Received payload:', JSON.stringify(req.body, null, 2));
    
    // 1. Extraer y validar datos básicos
    const { invoiceData: rawInvoiceData } = req.body;
    const invoiceData = rawInvoiceData.invoiceData || rawInvoiceData;
    
    if (!invoiceData) {
      console.error('Datos de factura faltantes');
      return res.status(400).json({
        message: 'Datos de factura faltantes',
        success: false
      });
    }

    // 2. Extraer identificadores
    const sellerId = invoiceData.jseller?.sdocno || '901832769';
    const id_orderDetail = invoiceData.sorderreference;
    console.log('Procesando orden:', id_orderDetail);

    // 3. Validar orden
    const orderDetail = await OrderDetail.findOne({
      where: { id_orderDetail }
    });

    if (!orderDetail) {
      console.error('Orden no encontrada:', id_orderDetail);
      return res.status(404).json({
        message: 'Orden no encontrada',
        success: false,
        orderReference: id_orderDetail
      });
    }

    // 4. Verificar estado de la orden
    console.log('Estado actual de la orden:', orderDetail.status);
    if (orderDetail.status === 'facturada') {
      console.log('=== Orden previamente facturada ===');
      return res.status(400).json({
        message: 'La orden ya está facturada',
        success: false,
        orderReference: id_orderDetail,
        invoicedAt: orderDetail.updatedAt
      });
    }

    // 5. Obtener datos adicionales
    console.log('=== Consultando datos adicionales ===');
    const [sellerData, userData] = await Promise.all([
      SellerData.findOne({ where: { sdocno: sellerId } }),
      User.findOne({ where: { n_document: orderDetail.n_document } })
    ]);

    // 6. Validar datos del vendedor
    if (!sellerData) {
      console.error('Datos del vendedor no encontrados:', sellerId);
      return res.status(404).json({
        message: 'Datos del vendedor no encontrados',
        success: false,
        sellerId
      });
    }

    // 7. Validar datos del comprador
    if (!userData) {
      console.error('Datos del comprador no encontrados:', orderDetail.n_document);
      return res.status(404).json({
        message: 'Datos del comprador no encontrados',
        success: false,
        buyerId: orderDetail.n_document
      });
    }

    // 8. Construir documento para Taxxa
    console.log('=== Construyendo documento para Taxxa ===');
    const documentBody = {
      sMethod: 'classTaxxa.fjDocumentAdd',
      jParams: {
        wVersionUBL: "2.1",
        wenvironment: "prod", // Cambiado a prod
        jDocument: {
          wVersionUBL: "2.1",
          wenvironment: "prod", // Cambiado a prod
          wdocumenttype: invoiceData.wdocumenttype,
          wdocumenttypecode: invoiceData.wdocumenttypecode,
          scustomizationid: invoiceData.scustomizationid,
          wcurrency: invoiceData.wcurrency,
          sdocumentprefix: invoiceData.sdocumentprefix,
          sdocumentsuffix: invoiceData.sdocumentsuffix,
          tissuedate: invoiceData.tissuedate,
          tduedate: invoiceData.tduedate,
          wpaymentmeans: invoiceData.wpaymentmeans,
          wpaymentmethod: invoiceData.wpaymentmethod,
          nlineextensionamount: invoiceData.nlineextensionamount,
          ntaxexclusiveamount: invoiceData.ntaxexclusiveamount,
          ntaxinclusiveamount: invoiceData.ntaxinclusiveamount,
          npayableamount: invoiceData.npayableamount,
          sorderreference: invoiceData.sorderreference,
          snotes: invoiceData.snotes || "",
          snotetop: invoiceData.snotetop || "",
          jextrainfo: invoiceData.jextrainfo,
          jdocumentitems: invoiceData.jdocumentitems,
          jbuyer: invoiceData.jbuyer,
          jseller: {
            wlegalorganizationtype: 'company',
            sfiscalresponsibilities: "O-47", // Corregido de R-99-PN a O-47
            sdocno: "901832769",
            sdoctype: "NIT",
            ssellername: "BONITA BOUTIQUE YP S.A.S",
            ssellerbrand: "BONITA BOUTIQUE CUMARAL",
            scontactperson: "ROSALES TAPIA YANIRIS PATRICIA",
            saddresszip: "501021",
            wdepartmentcode: "50",
            wtowncode: "50226",
            scityname: "CUMARAL",
            jcontact: {
              selectronicmail: "bonitaboutiquecumaral@gmail.com",
              jregistrationaddress: {
                wdepartmentcode: "50",
                sdepartmentname: "META",
                scityname: "CUMARAL",
                saddressline1: "CL 12 17 51 LC 3 Y 4",
                scountrycode: "CO",
                wprovincecode: "50226",
                szip: "501021"
              }
            }
          }
        }
      }
    };

    // 9. Generar token
    console.log('=== Generando token para Taxxa ===');
    const token = await generateToken();
    if (!token) {
      throw new Error('No se pudo generar el token de autenticación');
    }

    // 10. Preparar payload final
    const taxxaPayload = {
      stoken: token,
      jApi: documentBody
    };

    console.log('=== Enviando documento a Taxxa ===');
    console.log('Payload a enviar:', JSON.stringify(taxxaPayload, null, 2));

    // 11. Enviar documento
    const taxxaResponse = await sendDocument(taxxaPayload);
    console.log('Respuesta de Taxxa:', JSON.stringify(taxxaResponse, null, 2));

    // 12. Procesar respuesta
    if (taxxaResponse && taxxaResponse.rerror === 0) {
      console.log('=== Actualizando estado de la orden ===');
      await orderDetail.update({ status: 'facturada' });

      return res.status(200).json({
        message: 'Factura creada y enviada con éxito',
        success: true,
        response: taxxaResponse,
        orderReference: id_orderDetail
      });
    }

    throw new Error(`Error en la respuesta de Taxxa: ${JSON.stringify(taxxaResponse)}`);

  } catch (error) {
    console.error('=== Error en el proceso de facturación ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response status:', error.response.status);
    }

    return res.status(500).json({
      message: 'Error al procesar la factura',
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
};

module.exports = {
  createInvoice
};