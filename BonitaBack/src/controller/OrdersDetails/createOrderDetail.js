const { OrderDetail, Product, StockMovement } = require("../../data");
const response = require("../../utils/response");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const secretoIntegridad = "prod_integrity_LpUoK811LHCRNykBpQQp67JwmjESi7OD"; // Asegúrate que esta sea tu clave de PRODUCCIÓN

function generarFirmaIntegridad(referencia, montoEnCentavos, moneda, secretoIntegridad) {
  const cadenaConcatenada = `${referencia}${montoEnCentavos}${moneda}${secretoIntegridad}`;
  console.log("Cadena para firma:", cadenaConcatenada); // Log para depurar firma
  return crypto.createHash("sha256").update(cadenaConcatenada).digest("hex");
}

module.exports = async (req, res) => {
  try {
    const {
      date,
      amount,
      quantity,
      state_order,
      products,
      address,
      deliveryAddress,
      shippingCost = 0,
      n_document,
      pointOfSale,
      discount = 0 // Asegúrate de que discount tenga un valor por defecto
    } = req.body;

    // --- Validaciones (sin cambios) ---
    if (!date || !amount || !quantity || !state_order || !products || !address) {
      return response(res, 400, { error: "Missing Ordering Data" });
    }
    if (!["Local", "Online", "Coordinar por Whatsapp"].includes(pointOfSale)) { // Corregido Whatsapp -> WhatsApp si es necesario
       return response(res, 400, { error: "Invalid pointOfSale value" });
    }
     if (amount <= 0 || quantity <= 0 || !Array.isArray(products) || products.length === 0) {
       return response(res, 400, { error: "Invalid Ordering Data" });
     }
    // ---------------------------------

    const totalAmount = Math.max(0, Number(amount) - Number(discount) + Number(shippingCost)); // Aplica descuento
const amountInCents = Math.round(totalAmount * 100); // Asegura que sea entero

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
    const newOrderId = uuidv4(); // Genera el ID que se usará
    const firmaReal = generarFirmaIntegridad(
        newOrderId, // Usa el ID que se va a guardar
        amountInCents,
        "COP",
        secretoIntegridad
    );
    console.log("ID generado:", newOrderId);
    console.log("Firma generada:", firmaReal);

    const dateColombia = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Bogota" })
    );

    // *** PASO 2: Crear la orden CON el ID y la Firma ***
    const orderDetail = await OrderDetail.create({
      id_orderDetail: newOrderId,
      date: dateColombia, // <-- Ahora guarda la fecha local de Colombia
      amount: totalAmount, // Guarda el monto ya con descuento aplicado
      shippingCost,
      quantity,
      state_order,
      address,
      deliveryAddress: finalDeliveryAddress,
      n_document,
      pointOfSale,
      integritySignature: firmaReal,
      isFacturable,
      discount // Guarda el descuento aplicado
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
      where: { id_orderDetail: orderDetail.id_orderDetail }, // Usa el ID real
      include: { model: Product, as: "products", attributes: ["id_product", "stock", "description", "price"] },
    });

    // Logs para depuración
    console.log("Creando orden con los siguientes datos:", { date, amount: totalAmount, pointOfSale, products, address, deliveryAddress: finalDeliveryAddress });
    console.log("Orden creada:", updatedOrderDetail.toJSON());

    // Estructura de respuesta (sin cambios respecto a la corrección anterior)
    const responseData = {
        order: updatedOrderDetail.toJSON()
    };

    // Añadir wompiData si es Online (sin cambios respecto a la corrección anterior)
    if (pointOfSale === "Online") {
      responseData.order.wompiData = {
        referencia: orderDetail.id_orderDetail, // ID real
        integritySignature: firmaReal,          // Firma real
        amount: amountInCents                   // Monto en centavos
      };
    }

    console.log("Enviando respuesta:", responseData);
    return response(res, 201, responseData);

  } catch (error) {
    // Loguea el error completo para más detalles
    console.error("Error creating orderDetail:", error);
    // Devuelve un mensaje de error genérico o específico si es una validación
    const errorMessage = error.name === 'SequelizeValidationError'
      ? error.errors.map(e => e.message).join(', ')
      : error.message;
    return response(res, 500, { error: errorMessage });
  }
};