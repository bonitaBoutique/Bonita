const response = require("../../utils/response");
const { listPaymentIntents } = require("../../services/payments/paymentIntentService");

module.exports = async (req, res) => {
  try {
    const { status, page, limit, search, fromDate, toDate } = req.query;
    const { paymentIntents, pagination } = await listPaymentIntents({
      status,
      page,
      limit,
      search,
      fromDate,
      toDate,
    });

    return response(res, 200, {
      paymentIntents,
      pagination,
    });
  } catch (error) {
    console.error("❌ [PAYMENT INTENTS] Error al listar pagos en línea:", error);
    return response(res, 500, { error: error.message });
  }
};
