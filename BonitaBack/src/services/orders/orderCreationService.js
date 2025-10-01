const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { OrderDetail, Product, StockMovement } = require("../../data");
const { formatDateForDB, getColombiaDate } = require("../../utils/dateUtils");
const { WOMPI_INTEGRITY_SECRET } = require("../../config/envs");

const DEFAULT_CURRENCY = "COP";
const ALLOWED_POS = ["Local", "Online", "Coordinar por Whatsapp"];

function generateIntegritySignature(reference, amountInCents, currency = DEFAULT_CURRENCY, secret = WOMPI_INTEGRITY_SECRET) {
  const fallbackSecret = secret || "";
  if (!secret) {
    console.warn("⚠️  WOMPI_INTEGRITY_SECRET no configurado. Generando firma sin secreto.");
  }
  const payload = `${reference}${amountInCents}${currency}${fallbackSecret}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function normalizeAmount(amount, discount = 0, shippingCost = 0) {
  const subtotal = Number(amount) || 0;
  const normalizedDiscount = Number(discount) || 0;
  const normalizedShipping = Number(shippingCost) || 0;
  return Math.max(0, subtotal - normalizedDiscount + normalizedShipping);
}

async function fetchProductsSnapshot(products, transaction) {
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("La orden debe incluir al menos un producto");
  }

  const productIds = products.map((p) => p.id_product);
  const dbProducts = await Product.findAll({
    where: { id_product: productIds },
    attributes: ["id_product", "stock", "isDian", "description", "price"],
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  });

  const missingProducts = productIds.filter(
    (id) => !dbProducts.some((dbProduct) => dbProduct.id_product === id)
  );

  if (missingProducts.length > 0) {
    throw new Error(`Productos no encontrados: ${missingProducts.join(", ")}`);
  }

  const outOfStock = dbProducts.filter((dbProduct) => {
    const orderProduct = products.find((p) => p.id_product === dbProduct.id_product);
    return dbProduct.stock < orderProduct.quantity;
  });

  if (outOfStock.length > 0) {
    const detail = outOfStock.map((p) => ({
      id_product: p.id_product,
      stockDisponible: p.stock,
    }));
    const error = new Error("Not enough stock for some products");
    error.products = detail;
    throw error;
  }

  return dbProducts;
}

async function attachProductsAndAdjustStock(orderDetail, products, transaction) {
  for (const product of products) {
    await StockMovement.create(
      {
        id_movement: uuidv4(),
        id_product: product.id_product,
        type: "OUT",
        quantity: product.quantity,
        reason: "SALE",
        reference_id: orderDetail.id_orderDetail,
        reference_type: "ORDER",
      },
      { transaction }
    );

    await Product.decrement("stock", {
      by: product.quantity,
      where: { id_product: product.id_product },
      transaction,
    });

    await orderDetail.addProduct(product.id_product, {
      through: { quantity: product.quantity },
      transaction,
    });
  }
}

async function createOrderWithProducts(orderInput, options = {}) {
  const {
    products,
    amount,
    quantity,
    state_order,
    address,
    deliveryAddress,
    n_document,
    pointOfSale,
    shippingCost = 0,
    discount = 0,
    orderId = uuidv4(),
    integritySignature,
    paymentIntentId = null,
    transaction_status = "Pendiente",
    pointOfSaleOverride,
    date,
  } = orderInput;

  const { transaction, currency = DEFAULT_CURRENCY } = options;

  if (!amount || !quantity || !state_order || !address) {
    throw new Error("Missing Ordering Data");
  }

  if (!ALLOWED_POS.includes(pointOfSale)) {
    throw new Error("Invalid pointOfSale value");
  }

  const totalAmount = normalizeAmount(amount, discount, shippingCost);
  const amountInCents = Math.round(totalAmount * 100);

  const dbProducts = await fetchProductsSnapshot(products, transaction);
  const isFacturable = dbProducts.some((product) => product.isDian);
  const finalDeliveryAddress = address === "Envio a domicilio" ? deliveryAddress : null;

  const serverDate = getColombiaDate();
  const dateToSave = formatDateForDB(date || serverDate);

  // 🔍 DEBUG: Log para rastrear el problema de fechas
  console.log('🔍 [ORDER CREATION] Procesando fechas:', {
    'fecha recibida del frontend': date,
    'fecha del servidor': serverDate,
    'fecha que se guardará en BD': dateToSave,
    'formatDateForDB input': date || serverDate,
    'formatDateForDB output': dateToSave
  });

  const computedSignature = integritySignature || generateIntegritySignature(orderId, amountInCents, currency);

  const orderDetail = await OrderDetail.create(
    {
      id_orderDetail: orderId,
      date: dateToSave,
      amount: totalAmount,
      shippingCost,
      quantity,
      state_order,
      address,
      deliveryAddress: finalDeliveryAddress,
      n_document,
      pointOfSale: pointOfSaleOverride || pointOfSale,
      integritySignature: computedSignature,
      isFacturable,
      discount,
      transaction_status,
    },
    { transaction }
  );

  await attachProductsAndAdjustStock(orderDetail, products, transaction);

  const createdOrder = await OrderDetail.findOne({
    where: { id_orderDetail: orderDetail.id_orderDetail },
    include: { model: Product, as: "products", attributes: ["id_product", "stock", "description", "price"] },
    transaction,
  });

  return {
    order: createdOrder,
    amountInCents,
    integritySignature: computedSignature,
  };
}

module.exports = {
  createOrderWithProducts,
  generateIntegritySignature,
  normalizeAmount,
  fetchProductsSnapshot,
};
