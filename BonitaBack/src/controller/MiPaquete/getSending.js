const axios = require('axios');
const response = require('../../utils/response');

const getSendings = async (req, res) => {
  try {
    const { pageSize = 10, mpCode, confirmationDate } = req.body;

    const config = {
      method: 'post',
      url: `${process.env.MI_PAQUETE_URL}/getSendings`,
      headers: {
        'Content-Type': 'application/json',
        'session-tracker': process.env.MI_PAQUETE_SESSION_TRACKER,
        'apikey': process.env.MI_PAQUETE_API_KEY
      },
      data: {
        pageSize: parseInt(pageSize),
        mpCode: mpCode ? parseInt(mpCode) : undefined,
        confirmationDate
      }
    };

    const { data } = await axios(config);
    return response(res, 200, { error: false, data });

  } catch (error) {
    console.error('Get Sendings Error:', error.response?.data);
    return response(res, error.response?.status || 500, {
      error: true,
      message: error.response?.data?.message?.detail || error.message
    });
  }
};

const getSendingById = async (req, res) => {
  try {
    const { id } = req.params;

    const config = {
      method: 'post',
      url: `${process.env.MI_PAQUETE_URL}/getSendings/${id}`,
      headers: {
        'Content-Type': 'application/json',
        'session-tracker': process.env.MI_PAQUETE_SESSION_TRACKER,
        'apikey': process.env.MI_PAQUETE_API_KEY
      }
    };

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

module.exports = getSendings

