const axios = require('axios');
const response = require('../../utils/response');

const createDirection = async (req, res) => {
  try {
    const directionData = req.body;

    const config = {
      method: 'post',
      url: `${process.env.MI_PAQUETE_URL}/myDirections`,
      headers: {
        'Content-Type': 'application/json',
        'session-tracker': process.env.MI_PAQUETE_SESSION_TRACKER,
        'apikey': process.env.MI_PAQUETE_API_KEY
      },
      data: [directionData]
    };

    const { data } = await axios(config);
    return response(res, 201, { error: false, data });

  } catch (error) {
    console.error('Create Direction Error:', error.response?.data);
    return response(res, error.response?.status || 500, {
      error: true, 
      message: error.response?.data?.message || error.message
    });
  }
};

module.exports = createDirection;  