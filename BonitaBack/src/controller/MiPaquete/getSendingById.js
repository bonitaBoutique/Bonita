const axios = require('axios');
const response = require('../../utils/response');

const getSendingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryCompany, startDate, endDate, pageSize = 25 } = req.body;
    
    const requestData = {
      pageSize,
      ...(deliveryCompany && { deliveryCompany: [deliveryCompany] }),
      confirmationDate: {
        init: startDate || "2020-07-08",
        end: endDate || "2021-07-08"
      }
    };

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${process.env.MI_PAQUETE_URL}/getSendings/${id}`,
      headers: {
        'Content-Type': 'application/json',
        'session-tracker': process.env.MI_PAQUETE_SESSION_TRACKER,
        'apikey': process.env.MI_PAQUETE_API_KEY
      },
      data: requestData
    };

    console.log('Request:', { url: config.url, data: requestData });

    const { data } = await axios(config);
    return response(res, 200, { error: false, data });

  } catch (error) {
    console.error('Get Sending By Id Error:', error.response?.data);
    return response(res, error.response?.status || 500, {
      error: true,
      message: error.response?.data?.message?.detail || error.message
    });
  }
};

module.exports = getSendingById;