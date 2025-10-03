const response = require("../../utils/response");
const { createPaymentIntent } = require("../../services/payments/paymentIntentService");
const { User } = require("../../data"); // ✅ AGREGAR: Importar modelo User

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

    // ✅ NUEVO: Si no vienen email o nombre, buscarlos en la base de datos
    let finalCustomerEmail = customerEmail;
    let finalCustomerName = customerName;

    if ((!customerEmail || !customerName) && n_document) {
      console.log(`🔍 [PAYMENT INTENT] Email o nombre faltante, buscando usuario con documento: ${n_document}`);
      
      try {
        const user = await User.findOne({ where: { n_document } });
        
        if (user) {
          finalCustomerEmail = customerEmail || user.email;
          finalCustomerName = customerName || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
          console.log(`✅ [PAYMENT INTENT] Datos del usuario encontrados: ${finalCustomerName} (${finalCustomerEmail})`);
        } else {
          console.warn(`⚠️ [PAYMENT INTENT] Usuario no encontrado para documento: ${n_document}`);
        }
      } catch (userError) {
        console.error(`❌ [PAYMENT INTENT] Error al buscar usuario:`, userError);
        // Continuar sin los datos del usuario
      }
    }

    const { paymentIntent, wompiData } = await createPaymentIntent({
      amount,
      discount,
      shippingCost,
      currency,
      products,
      n_document,
      customerEmail: finalCustomerEmail, // ✅ Usar email encontrado o el enviado
      customerName: finalCustomerName,   // ✅ Usar nombre encontrado o el enviado
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
