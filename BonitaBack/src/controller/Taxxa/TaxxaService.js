const { SellerData, User, OrderDetail } = require('../../data');
const { generateToken, sendDocument } = require('./taxxaUtils');

const createInvoice = async (req, res) => {
  try {
    console.log('=== Iniciando proceso de facturación ===');
    console.log('Received payload:', JSON.stringify(req.body, null, 2));
    
    const { invoiceData } = req.body;
    
    // Validación inicial de datos
    if (!invoiceData) {
      console.error('Datos de factura faltantes');
      return res.status(400).json({
        message: 'Datos de factura faltantes',
        success: false
      });
    }
  
    // Extraer IDs necesarios
    const sellerId = invoiceData.jseller?.sdocno || '901832769';
    const id_orderDetail = invoiceData.sorderreference;
    console.log('Procesando orden:', id_orderDetail);

    // Validar que exista el ID de la orden
    if (!id_orderDetail) {
      console.error('ID de orden no proporcionado');
      return res.status(400).json({
        message: 'ID de orden no proporcionado',
        success: false
      });
    }

    // Obtener detalles de la orden
    const orderDetail = await OrderDetail.findOne({
      where: { id_orderDetail }
    });

    // Validar existencia de la orden
    if (!orderDetail) {
      console.error('Orden no encontrada:', id_orderDetail);
      return res.status(404).json({
        message: 'Orden no encontrada',
        success: false,
        orderReference: id_orderDetail
      });
    }

    // Verificar estado de la orden
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

    // Obtener datos del vendedor y usuario en paralelo
    console.log('=== Consultando datos adicionales ===');
    const [sellerData, userData] = await Promise.all([
      SellerData.findOne({ where: { sdocno: sellerId } }),
      User.findOne({ where: { n_document: orderDetail.n_document } })
    ]);

    // Validar datos del vendedor
    if (!sellerData) {
      console.error('Datos del vendedor no encontrados:', sellerId);
      return res.status(404).json({
        message: 'Datos del vendedor no encontrados',
        success: false,
        sellerId
      });
    }

    // Validar datos requeridos del vendedor
    if (!sellerData.contact_selectronicmail || !sellerData.registration_saddressline1) {
      console.error('Datos incompletos del vendedor');
      return res.status(400).json({
        message: 'Datos del vendedor incompletos (correo o dirección)',
        success: false,
        sellerId
      });
    }

    // Validar datos del comprador
    if (!userData) {
      console.error('Datos del comprador no encontrados:', orderDetail.n_document);
      return res.status(404).json({
        message: 'Datos del comprador no encontrados',
        success: false,
        buyerId: orderDetail.n_document
      });
    }

    // Construir el documento para Taxxa
    console.log('=== Construyendo documento para Taxxa ===');
    const documentBody = {
      sMethod: 'classTaxxa.fjDocumentAdd',
      jParams: {
        wVersionUBL: "2.1",
        wenvironment: "test",
        jDocument: {
          ...invoiceData,
          jseller: {
            wlegalorganizationtype: sellerData.wlegalorganizationtype || 'company',
            sfiscalresponsibilities: sellerData.sfiscalresponsibilities,
            sdocno: sellerData.sdocno,
            sdoctype: sellerData.sdoctype,
            ssellername: sellerData.ssellername,
            ssellerbrand: sellerData.ssellerbrand,
            scontactperson: sellerData.scontactperson,
            saddresszip: sellerData.saddresszip,
            wdepartmentcode: sellerData.wdepartmentcode,
            wtowncode: sellerData.wtowncode || '501021',
            scityname: sellerData.scityname,
            jcontact: {
              selectronicmail: sellerData.contact_selectronicmail,
              jregistrationaddress: {
                wdepartmentcode: sellerData.registration_wdepartmentcode,
                scityname: sellerData.registration_scityname,
                saddressline1: sellerData.registration_saddressline1,
                scountrycode: sellerData.registration_scountrycode || 'CO',
                wprovincecode: sellerData.registration_wprovincecode,
                szip: sellerData.registration_szip,
                sdepartmentname: sellerData.registration_sdepartmentname
              }
            }
          }
        }
      }
    };

    // Generar token
    console.log('=== Generando token para Taxxa ===');
    const token = await generateToken();
    if (!token) {
      throw new Error('No se pudo generar el token de autenticación');
    }

    // Preparar y enviar payload
    const taxxaPayload = {
      stoken: token,
      jApi: documentBody
    };

    console.log('=== Enviando documento a Taxxa ===');
    const taxxaResponse = await sendDocument(taxxaPayload);
    console.log('Respuesta de Taxxa:', JSON.stringify(taxxaResponse, null, 2));

    // Procesar respuesta
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