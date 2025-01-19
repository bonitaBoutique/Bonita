const axios = require('axios');
const response = require('../../utils/response');
const { MI_PAQUETE_URL, MI_PAQUETE_API_KEY, MI_PAQUETE_SESSION_TRACKER } = require('../../config/envs');

const getLocations = async (req, res) => {
  try {
    const { locationCode } = req.query;

    // // Debug logging
    // console.log('Environment variables:', {
    //   MI_PAQUETE_URL,
    //   MI_PAQUETE_API_KEY: MI_PAQUETE_API_KEY ? 'Set' : 'Not set',
    //   MI_PAQUETE_SESSION_TRACKER
    // });

    // Validate required environment variables
    if (!MI_PAQUETE_API_KEY || !MI_PAQUETE_SESSION_TRACKER) {
      console.error('Missing required environment variables');
      return response(res, 500, {
        error: true,
        message: "Missing required MiPaquete configuration"
      });
    }

    const config = {
      method: 'get',
      url: `${MI_PAQUETE_URL}/getLocations`,
      params: {
        locationCode
      },
      headers: {
        'session-tracker': MI_PAQUETE_SESSION_TRACKER,
        'apikey': MI_PAQUETE_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    console.log('Request config:', {
      url: config.url,
      params: config.params,
      headers: {
        'session-tracker': config.headers['session-tracker'],
        'apikey': 'Present'
      }
    });

    const { data } = await axios(config);
    return response(res, 200, { 
      error: false,
      data 
    });

  } catch (error) {
    console.error('Error getting locations:', {
      message: error.message,
      response: error.response?.data
    });
    
    return response(res, error.response?.status || 500, {
      error: true,
      message: error.response?.data || error.message
    });
  }
};

module.exports = getLocations;