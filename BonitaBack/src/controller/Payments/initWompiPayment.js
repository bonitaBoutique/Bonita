const response = require("../../utils/response");
const { createPaymentIntent } = require("../../services/payments/paymentIntentService");

module.exports = async (req, res) => {
  try {
    const {
      amount,
      discount = 0,
      shippingCost = 0,
      currency,
      products,
      n_document,
      customerEmail,
      customerName,
      address,
      deliveryAddress,
      state_order,
      quantity,
      pointOfSale,
      date,
      metadata,
    } = req.body;

    if (!amount || !quantity || !products || !Array.isArray(products)) {
      return response(res, 400, { error: "Datos incompletos para iniciar el pago" });
    }

    const { paymentIntent, wompiData } = await createPaymentIntent({
      amount,
      discount,
      shippingCost,
      currency,
      products,
      n_document,
      customerEmail,
      customerName,
      address,
      deliveryAddress,
      state_order,
      quantity,
      pointOfSale,
      date,
      metadata,
    });

    return response(res, 201, {
      paymentIntent: {
        id: paymentIntent.id_payment_intent,
        reference: paymentIntent.wompi_reference,
        status: paymentIntent.status,
      },
      wompi: wompiData,
    });
  } catch (error) {
    console.error("❌ [PAYMENT INTENT] Error al crear intento de pago:", error);
    const statusCode = error.products ? 400 : 500;
    const message = error.products
      ? `${error.message}. Revise el stock de los productos indicados.`
      : error.message;
    return response(res, statusCode, { error: message, productosSinStock: error.products });
  }
};
