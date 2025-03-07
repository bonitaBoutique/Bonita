const axios = require('axios');
const response = require('../../utils/response');

// Valores requeridos por la API según documentación
const DEFAULT_VALUES = {
  originDaneCode: "50226", 
  originCountryCode: "170",
  destinyCountryCode: "170",
  deliveryCompany: "653928ae0a945520b78f279b",
  
};

const createSending = async (req, res) => {
  try {
    console.log('Request body received:', req.body);
    
    // Extraemos datos del request, omitiendo id_orderDetail que puede causar problemas
    const { id_orderDetail, ...requestWithoutId } = req.body;
    
    // Creamos el objeto requestData mezclando los datos recibidos con los valores requeridos
    const requestData = {
      adminTransactionData: { saleValue: 0 },
      channel: "Test API",
      comments: requestWithoutId.comments || "notas del pedidooo",
      criteria: "price",
      deliveryCompany: DEFAULT_VALUES.deliveryCompany,
      description: requestWithoutId.description || "notas del pedidooo",
      locate: {
        // Usamos el destinyDaneCode del request pero mantenemos los valores requeridos
        destinyDaneCode: requestWithoutId.locate?.destinyDaneCode || "20000",
        originDaneCode: DEFAULT_VALUES.originDaneCode,  // Usamos el valor esperado por la API
        originCountryCode: DEFAULT_VALUES.originCountryCode,  // Usamos el valor esperado por la API
        destinyCountryCode: DEFAULT_VALUES.destinyCountryCode  // Usamos el valor esperado por la API
      },
      paymentType: 101,  // Según el modelo requerido
      productInformation: {
        declaredValue: requestWithoutId.productInformation?.declaredValue || 10000,
        forbiddenProduct: true,
        height: requestWithoutId.productInformation?.height || 10,
        large: requestWithoutId.productInformation?.large || 10,
        productReference: "-",
        quantity: requestWithoutId.productInformation?.quantity || 1,
        weight: requestWithoutId.productInformation?.weight || 1,
        width: requestWithoutId.productInformation?.width || 10
      },
      receiver: {
        cellPhone: requestWithoutId.receiver?.cellPhone || "3000000000",
        destinationAddress: requestWithoutId.receiver?.destinationAddress || "Carera test # 3",
        email: requestWithoutId.receiver?.email || "Test@gmail.com",
        name: requestWithoutId.receiver?.name || "Test test",
        nit: ".",
        nitType: ".",
        prefix: "+57",
        surname: "."
      },
      requestPickup: "false",
      sender: {
        cellPhone: "3000000000",  // Mantenemos el valor estándar de la API
        email: "pruebasmipaqueteoficial@gmail.com",  // Mantenemos el valor estándar de la API
        name: "sebastian meneses",  // Mantenemos el valor estándar de la API
        nit: "1036638301",  // Mantenemos el valor estándar de la API
        nitType: "NIT",  // Mantenemos el valor estándar de la API
        pickupAddress: "reterterterterter",  // Mantenemos el valor estándar de la API
        prefix: "+57",
        surname: "."
      },
      user: DEFAULT_VALUES.user
    };

    console.log('Debug - Request Data:', JSON.stringify(requestData, null, 2));

    const { data } = await axios({
      method: 'post',
      url: `${process.env.MI_PAQUETE_URL}/createSending`,
      headers: {
        'Content-Type': 'application/json',
        'session-tracker': process.env.MI_PAQUETE_SESSION_TRACKER,
        'apikey': process.env.MI_PAQUETE_API_KEY
      },
      data: requestData
    });

    return response(res, 201, { error: false, data });

  } catch (error) {
    console.error('Create Sending Error:', {
      status: error.response?.status,
      data: error.response?.data,
      request: error.config?.data
    });
    return response(res, error.response?.status || 500, {
      error: true,
      message: error.response?.data?.message || error.message
    });
  }
};

module.exports = createSending;