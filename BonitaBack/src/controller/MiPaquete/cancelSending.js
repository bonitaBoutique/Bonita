const axios = require('axios');
const response = require('../../utils/response');

const cancelSending = async (req, res) => {
  try {
    const { mpCode } = req.body;

    if (!mpCode) {
      return response(res, 400, {
        error: true,
        message: 'mpCode is required'
      });
    }

    const config = {
      method: 'put',
      url: `${process.env.MI_PAQUETE_URL}/cancelSending`,
      headers: {
        'Content-Type': 'application/json',
        'session-tracker': process.env.MI_PAQUETE_SESSION_TRACKER,
        'apikey': process.env.MI_PAQUETE_API_KEY
      },
      data: { mpCode }
    };

    console.log('Cancel Request:', { mpCode });

    const { data } = await axios(config);
    return response(res, 200, { error: false, data });

  } catch (error) {
    console.error('Cancel Sending Error:', error.response?.data);
    return response(res, error.response?.status || 500, {
      error: true,
      message: error.response?.data?.message || error.message
    });
  }
};

module.exports = cancelSending;