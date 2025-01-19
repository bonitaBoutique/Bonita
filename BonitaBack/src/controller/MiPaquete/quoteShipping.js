const axios = require('axios');
const response = require('../../utils/response');

const DEFAULT_ORIGIN_COUNTRY_CODE = '484';
const DEFAULT_DESTINY_COUNTRY_CODE = '484';
const DEFAULT_ORIGIN_LOCATION = '07510';

const validateInput = (input) => {
  const required = [
    'destinyLocationCode',
    'height',
    'width',
    'length',
    'weight',
    'quantity',
    'declaredValue'
  ];
  const missing = required.filter(field => !input[field]);
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

const quoteShipping = async (req, res) => {
  try {
    validateInput(req.body);

    const {
      destinyLocationCode,
      height,
      width,
      length,
      weight,
      quantity,
      declaredValue,
      originLocationCode = DEFAULT_ORIGIN_LOCATION,
      originCountryCode = DEFAULT_ORIGIN_COUNTRY_CODE,
      destinyCountryCode = DEFAULT_DESTINY_COUNTRY_CODE
    } = req.body;

    const requestData = {
      originCountryCode,
      originLocationCode,
      destinyCountryCode,
      destinyLocationCode,
      quantity: parseInt(quantity),
      width: parseInt(width),
      length: parseInt(length),
      height: parseInt(height),
      weight: parseInt(weight),
      declaredValue: parseInt(declaredValue)
    };

    const config = {
      method: 'POST',
      url: `${process.env.MI_PAQUETE_URL}/quoteShipping`,
      headers: {
        'Content-Type': 'application/json',
        'session-tracker': process.env.MI_PAQUETE_SESSION_TRACKER,
        'apikey': process.env.MI_PAQUETE_API_KEY
      },
      data: requestData
    };

    console.log('Request details:', {
      url: config.url,
      headers: {
        'session-tracker': config.headers['session-tracker'],
        'apikey': config.headers['apikey']?.substring(0, 20) + '...'
      },
      data: requestData
    });

    const { data } = await axios(config);
    return response(res, 200, { error: false, data });

  } catch (error) {
    console.error('Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      config: error.config
    });

    if (error.response?.status === 401) {
      return response(res, 401, {
        error: true,
        message: 'Authentication failed. Please check API credentials.'
      });
    }

    return response(res, error.response?.status || 500, {
      error: true,
      message: error.response?.data?.message?.detail || error.message
    });
  }
};

module.exports = quoteShipping;