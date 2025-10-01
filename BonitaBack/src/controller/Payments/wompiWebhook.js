const crypto = require("crypto");
const response = require("../../utils/response");
const { WOMPI_EVENT_KEY } = require("../../config/envs");
const { handleWompiEvent } = require("../../services/payments/paymentIntentService");

function parseSignatureHeader(signatureHeader) {
  if (!signatureHeader) {
    throw new Error("Encabezado x-signature ausente");
  }

  try {
    if (Array.isArray(signatureHeader)) {
      return JSON.parse(signatureHeader[0]);
    }
    return JSON.parse(signatureHeader);
  } catch (error) {
    throw new Error("Formato de x-signature inválido");
  }
}

function getValueFromPath(payload, path) {
  return path.split(".").reduce((acc, segment) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[segment];
  }, payload);
}

function verifySignature(req) {
  if (!WOMPI_EVENT_KEY) {
    throw new Error("WOMPI_EVENT_KEY no configurado en el servidor");
  }

  const signatureHeader = req.headers["x-signature"] || req.headers["X-Signature"];
  const { checksum, properties } = parseSignatureHeader(signatureHeader);

  if (!checksum || !Array.isArray(properties)) {
    throw new Error("Encabezado x-signature incompleto");
  }

  const payloadString = properties
    .map((propertyPath) => {
      let value = getValueFromPath(req.body, propertyPath);

      if (value === undefined || value === null) {
        const headerFallback = req.headers[propertyPath.toLowerCase()];
        value = headerFallback !== undefined ? headerFallback : value;
      }

      if (value === undefined || value === null) {
        throw new Error(`Propiedad ${propertyPath} no encontrada para la firma`);
      }
      return String(value);
    })
    .join("");

  const computedChecksum = crypto
    .createHmac("sha256", WOMPI_EVENT_KEY)
    .update(payloadString)
    .digest("hex");

  if (computedChecksum !== checksum) {
    throw new Error("Firma inválida")
  }
}

module.exports = async (req, res) => {
  try {
    verifySignature(req);

    const { paymentIntent, order } = await handleWompiEvent(req.body);

    return response(res, 200, {
      paymentIntent: {
        id: paymentIntent.id_payment_intent,
        status: paymentIntent.status,
        orderReference: paymentIntent.order_reference,
        wompiTransactionId: paymentIntent.wompi_transaction_id,
      },
      orderCreated: Boolean(order),
      orderId: order?.id_orderDetail,
    });
  } catch (error) {
    console.error("❌ [WOMPI WEBHOOK] Error:", error);
    const status = error.message === "Firma inválida" ? 401 : 400;
    return response(res, status, { error: error.message });
  }
};
