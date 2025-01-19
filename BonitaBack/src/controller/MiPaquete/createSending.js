const axios = require('axios');
const response = require('../../utils/response');

const DEFAULT_VALUES = {
  originDaneCode: "50226", // Bogotá
  originCountryCode: "170",   // Mexico code per API docs
  destinyCountryCode: "170",  // Mexico code per API docs
  deliveryCompany: "653928ae0a945520b78f279b",
  user: "5e8cbd8508d7ea3dee8b14f6"
};

const createSending = async (req, res) => {
  try {
    const requestData = {
      adminTransactionData: { saleValue: 0 },
      channel: "Test API",
      comments: "notas del pedidooo",
      criteria: "price",
      deliveryCompany: DEFAULT_VALUES.deliveryCompany,
      description: "notas del pedidooo",
      locate: {
        destinyDaneCode: req.body.destinyLocationCode || "20000",
        originDaneCode: DEFAULT_VALUES.originDaneCode,
        originCountryCode: DEFAULT_VALUES.originCountryCode,
        destinyCountryCode: DEFAULT_VALUES.destinyCountryCode
      },
      paymentType: 101,
      productInformation: {
        declaredValue: req.body.declaredValue || 10000,
        forbiddenProduct: true,
        height: req.body.height || 10,
        large: req.body.length || 10,
        productReference: "-",
        quantity: req.body.quantity || 1,
        weight: req.body.weight || 1,
        width: req.body.width || 10
      },
      receiver: {
        cellPhone: "3000000000",
        destinationAddress: "Carera test # 3",
        email: "Test@gmail.com",
        name: "Test test",
        nit: ".",
        nitType: ".",
        prefix: "+57",
        surname: "."
      },
      requestPickup: "false",
      sender: {
        cellPhone: "3000000000",
        email: "pruebasmipaqueteoficial@gmail.com",
        name: "sebastian meneses",
        nit: "1036638301",
        nitType: "NIT",
        pickupAddress: "reterterterterter",
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
