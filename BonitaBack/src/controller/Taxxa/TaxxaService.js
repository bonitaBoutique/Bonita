const { SellerData, User, OrderDetail } = require('../../data');
const { generateToken, sendDocument } = require('./taxxaUtils');

const createInvoice = async (req, res) => {
  try {
    console.log('=== Iniciando proceso de facturación ===');
    console.log('Received payload:', JSON.stringify(req.body, null, 2));

    const { invoiceData, sellerId } = req.body;
    
    if (!invoiceData || !sellerId) {
      console.error('Datos de factura o vendedor faltantes');
      return res.status(400).json({ 
        message: 'Datos de factura o vendedor faltantes',
        success: false 
      });
    }

    const id_orderDetail = invoiceData.sorderreference;
    console.log('Procesando orden:', id_orderDetail);

    // First, get the order details
    const orderDetail = await OrderDetail.findOne({ 
      where: { id_orderDetail } 
    });

    // Validate order exists
    if (!orderDetail) {
      console.error('Orden no encontrada:', id_orderDetail);
      return res.status(404).json({ 
        message: 'Orden no encontrada',
        success: false,
        orderReference: id_orderDetail 
      });
    }

    // Check and log current order status
    console.log('Estado actual de la orden:', orderDetail.status);

    // Validate order status
    if (orderDetail.status === 'facturada') {
      console.log('=== Orden previamente facturada ===');
      console.log('ID Orden:', id_orderDetail);
      console.log('Estado:', orderDetail.status);
      console.log('Fecha de facturación:', orderDetail.updatedAt);

      return res.status(400).json({ 
        message: 'La orden ya está facturada',
        success: false,
        orderReference: id_orderDetail,
        invoicedAt: orderDetail.updatedAt 
      });
    }

    // Now get seller and user data in parallel
    console.log('=== Consultando datos adicionales ===');
    const [sellerData, userData] = await Promise.all([
      SellerData.findOne({ where: { sdocno: sellerId } }),
      User.findOne({ where: { n_document: orderDetail.n_document } })
    ]);

    // Validate and log seller data
    if (!sellerData) {
      console.error('Datos del vendedor no encontrados:', sellerId);
      return res.status(404).json({ 
        message: 'Datos del vendedor no encontrados',
        success: false,
        sellerId 
      });
    }
    console.log('Datos del vendedor encontrados:', sellerData.ssellername);

    // Validate and log user data
    if (!userData) {
      console.error('Datos del comprador no encontrados:', orderDetail.n_document);
      return res.status(404).json({ 
        message: 'Datos del comprador no encontrados',
        success: false,
        buyerId: orderDetail.n_document 
      });
    }
    console.log('Datos del comprador encontrados:', userData.first_name, userData.last_name);

    console.log('=== Construyendo documento para Taxxa ===');
    const documentBody = {
      sMethod: 'classTaxxa.fjDocumentAdd',
      jParams: {
        wVersionUBL: invoiceData.wVersionUBL,
        wenvironment: invoiceData.wenvironment,
        jDocument: {
          ...invoiceData,
          jseller: {
            wlegalorganizationtype: 'company',
            sfiscalresponsibilities: sellerData.sfiscalresponsibilities,
            sdocno: sellerData.sdocno,
            sdoctype: sellerData.sdoctype,
            ssellername: sellerData.ssellername,
            ssellerbrand: sellerData.ssellerbrand,
            scontactperson: sellerData.scontactperson,
            saddresszip: sellerData.saddresszip,
            wdepartmentcode: sellerData.wdepartmentcode,
            wtowncode: '501021',
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
                sdepartmentname: sellerData.registration_sdepartmentname,
              }
            }
          }
        }
      }
    };

    console.log('=== Generando token para Taxxa ===');
    const token = await generateToken();
    if (!token) {
      throw new Error('No se pudo generar el token de autenticación');
    }
    console.log('Token generado exitosamente');

    console.log('=== Enviando documento a Taxxa ===');
    const taxxaPayload = {
      stoken: token,
      jApi: documentBody
    };
    console.log('Payload completo:', JSON.stringify(taxxaPayload, null, 2));

    const taxxaResponse = await sendDocument(taxxaPayload);
    console.log('Respuesta de Taxxa:', JSON.stringify(taxxaResponse, null, 2));

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