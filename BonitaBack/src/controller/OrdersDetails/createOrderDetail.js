const { OrderDetail, Product, StockMovement } = require("../../data");
const response = require("../../utils/response");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { formatDateForDB, getColombiaDate } = require("../../utils/dateUtils"); // ✅ IMPORTAR getColombiaDate
const secretoIntegridad = "prod_integrity_LpUoK811LHCRNykBpQQp67JwmjESi7OD";

function generarFirmaIntegridad(referencia, montoEnCentavos, moneda, secretoIntegridad) {
  const cadenaConcatenada = `${referencia}${montoEnCentavos}${moneda}${secretoIntegridad}`;
  console.log("Cadena para firma:", cadenaConcatenada);
  return crypto.createHash("sha256").update(cadenaConcatenada).digest("hex");
}

module.exports = async (req, res) => {
  try {
    const {
      date, // ✅ TODAVÍA RECIBIR LA FECHA DEL FRONTEND PARA LOGGING
      amount,
      quantity,
      state_order,
      products,
      address,
      deliveryAddress,
      shippingCost = 0,
      n_document,
      pointOfSale,
      discount = 0
    } = req.body;

    // ✅ USAR FECHA DEL SERVIDOR (COLOMBIA) SIEMPRE
    const serverDate = getColombiaDate();
    console.log('🕒 [CREATE ORDER] Fecha del cliente:', date);
    console.log('🕒 [CREATE ORDER] Fecha del servidor (Colombia):', serverDate);

    // --- Validaciones (sin cambios) ---
    if (!amount || !quantity || !state_order || !products || !address) {
      return response(res, 400, { error: "Missing Ordering Data" });
    }
    if (!["Local", "Online", "Coordinar por Whatsapp"].includes(pointOfSale)) {
       return response(res, 400, { error: "Invalid pointOfSale value" });
    }
     if (amount <= 0 || quantity <= 0 || !Array.isArray(products) || products.length === 0) {
       return response(res, 400, { error: "Invalid Ordering Data" });
     }
    // ---------------------------------

    const totalAmount = Math.max(0, Number(amount) - Number(discount) + Number(shippingCost));
    const amountInCents = Math.round(totalAmount * 100);

    // --- Verificación de stock (sin cambios) ---
    const productIds = products.map(p => p.id_product);
    const dbProducts = await Product.findAll({ where: { id_product: productIds }, attributes: ["id_product", "stock", "isDian"] });
    const productosSinStock = dbProducts.filter((dbProduct) => {
       const ordenProducto = products.find(p => p.id_product === dbProduct.id_product);
       return dbProduct.stock < ordenProducto.quantity;
    });
    if (productosSinStock.length > 0) {
       return response(res, 400, { error: "Not enough stock for some products", productosSinStock });
    }
    // ---------------------------------------

    const isFacturable = dbProducts.some(product => product.isDian);
    const finalDeliveryAddress = address === "Envio a domicilio" ? deliveryAddress : null;

    // *** PASO 1: Generar ID y Firma ANTES de crear ***
    const newOrderId = uuidv4();
    const firmaReal = generarFirmaIntegridad(
        newOrderId,
        amountInCents,
        "COP",
        secretoIntegridad
    );
    console.log("ID generado:", newOrderId);
    console.log("Firma generada:", firmaReal);

    // ✅ USAR FECHA DEL SERVIDOR EN LUGAR DE LA DEL CLIENTE
    const dateToSave = formatDateForDB(serverDate);

    const orderDetail = await OrderDetail.create({
      id_orderDetail: newOrderId,
      date: dateToSave, // ✅ Fecha del servidor (Colombia)
      amount: totalAmount,
      shippingCost,
      quantity,
      state_order,
      address,
      deliveryAddress: finalDeliveryAddress,
      n_document,
      pointOfSale,
      integritySignature: firmaReal,
      isFacturable,
      discount
    });

    // --- Asociar productos y actualizar stock (sin cambios) ---
    await Promise.all(
      products.map(async (product) => {
        await StockMovement.create({ id_movement: uuidv4(), id_product: product.id_product, type: "OUT", quantity: product.quantity });
        await Product.decrement("stock", { by: product.quantity, where: { id_product: product.id_product } });
        await orderDetail.addProduct(product.id_product, { through: { quantity: product.quantity } });
      })
    );
    // -------------------------------------------------------

    // Obtener la orden actualizada con los productos
    const updatedOrderDetail = await OrderDetail.findOne({
      where: { id_orderDetail: orderDetail.id_orderDetail },
      include: { model: Product, as: "products", attributes: ["id_product", "stock", "description", "price"] },
    });

    // ✅ LOGS MEJORADOS
    console.log("🟢 [CREATE ORDER] Orden creada con fecha del servidor:", {
      id: newOrderId,
      clientDate: date,
      serverDate: serverDate,
      savedDate: dateToSave,
      amount: totalAmount,
      pointOfSale,
      timezone: 'America/Bogota'
    });

    // Estructura de respuesta
    const responseData = {
        order: updatedOrderDetail.toJSON()
    };

    // Añadir wompiData si es Online
    if (pointOfSale === "Online") {
      responseData.order.wompiData = {
        referencia: orderDetail.id_orderDetail,
        integritySignature: firmaReal,
        amount: amountInCents
      };
    }

    console.log("✅ [CREATE ORDER] Enviando respuesta con fecha consistente");
    return response(res, 201, responseData);

  } catch (error) {
    console.error("❌ [CREATE ORDER] Error:", error);
    const errorMessage = error.name === 'SequelizeValidationError'
      ? error.errors.map(e => e.message).join(', ')
      : error.message;
    return response(res, 500, { error: errorMessage });
  }
};