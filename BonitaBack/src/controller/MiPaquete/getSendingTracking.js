const axios = require('axios');
const response = require('../../utils/response');

const getSendingTracking = async (req, res) => {
  try {
    const { mpCode } = req.query;

    if (!mpCode) {
      return response(res, 400, {
        error: true,
        message: 'mpCode is required'
      });
    }

    const config = {
      method: 'get',
      url: `${process.env.MI_PAQUETE_URL}/getSendingTracking`,
      headers: {
        'Content-Type': 'application/json',
        'session-tracker': process.env.MI_PAQUETE_SESSION_TRACKER,
        'apikey': process.env.MI_PAQUETE_API_KEY
      },
      params: { mpCode }
    };

    const { data } = await axios(config);
    return response(res, 200, { error: false, data });

  } catch (error) {
    console.error('Get Tracking Error:', error.response?.data);
    return response(res, error.response?.status || 500, {
      error: true,
      message: error.response?.data?.message || error.message
    });
  }
};

module.exports = getSendingTracking;