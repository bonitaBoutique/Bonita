const axios = require('axios');
const response = require('../../utils/response');

const generateApiKey = async (req, res) => {
  try {
    const { email, password } = req.body;

    const config = {
      method: 'post',
      url: `${process.env.MI_PAQUETE_URL}/generateapikey`,
      headers: {
        'Content-Type': 'application/json',
        'session-tracker': process.env.MI_PAQUETE_SESSION_TRACKER
      },
      data: { email, password }
    };

    const { data } = await axios(config);
    return response(res, 200, { error: false, data });

  } catch (error) {
    console.error('Generate API Key Error:', error.response?.data);
    return response(res, error.response?.status || 500, {
      error: true,
      message: error.response?.data?.message || error.message
    });
  }
};

module.exports = generateApiKey;

