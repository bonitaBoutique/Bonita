const { v4: uuidv4 } = require("uuid");
const { PaymentIntent, conn } = require("../../data");
const { Op } = require("sequelize");
const { createOrderWithProducts, generateIntegritySignature, normalizeAmount, fetchProductsSnapshot } = require("../orders/orderCreationService");

const DEFAULT_STATE_ORDER = "Pedido Realizado";
const DEFAULT_CURRENCY = "COP";

const STATUS_MAP = {
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
  VOIDED: "VOIDED",
  ERROR: "ERROR",
  PENDING: "PENDING",
};

function buildProductsSnapshot(products, dbProducts) {
  return products.map((product) => {
    const dbProduct = dbProducts.find((item) => item.id_product === product.id_product);
    return {
      id_product: product.id_product,
      quantity: Number(product.quantity) || 0,
      price: dbProduct?.price ?? product.price,
      description: dbProduct?.description ?? product.description,
    };
  });
}

async function createPaymentIntent(orderPayload) {
  const {
    amount,
    discount = 0,
    shippingCost = 0,
    currency = DEFAULT_CURRENCY,
    products,
    n_document,
    customerEmail,
    customerName,
    address,
    deliveryAddress,
    state_order = DEFAULT_STATE_ORDER,
    quantity,
    pointOfSale,
    date,
    metadata = {},
  } = orderPayload;

  if (pointOfSale !== "Online") {
    throw new Error("Solo se pueden crear PaymentIntents para ventas en línea");
  }

  const dbProducts = await fetchProductsSnapshot(products); // Valida existencia y stock

  const subtotalFromDb = dbProducts.reduce((acc, dbProduct) => {
    const orderProduct = products.find((item) => item.id_product === dbProduct.id_product);
    const quantityRequested = Number(orderProduct?.quantity || 0);
    const unitPrice = Number(dbProduct.price || 0);
    return acc + unitPrice * quantityRequested;
  }, 0);

  const totalAmount = normalizeAmount(subtotalFromDb, discount, shippingCost);
  if (totalAmount <= 0) {
    throw new Error("El monto total debe ser mayor a cero");
  }

  const totalQuantity = quantity ?? products.reduce((acc, product) => acc + Number(product.quantity || 0), 0);
  if (!totalQuantity || totalQuantity <= 0) {
    throw new Error("La cantidad total de productos debe ser mayor a cero");
  }

  const amountInCents = Math.round(totalAmount * 100);
  const orderReference = uuidv4();
  const integritySignature = generateIntegritySignature(orderReference, amountInCents, currency);

  const paymentIntent = await PaymentIntent.create({
    order_reference: orderReference,
    wompi_reference: orderReference,
    integrity_signature: integritySignature,
    status: STATUS_MAP.PENDING,
    amount_in_cents: amountInCents,
    currency,
    shipping_cost: shippingCost,
    discount,
    customer_document: n_document,
    customer_email: customerEmail,
    customer_name: customerName,
    address_type: address,
    delivery_address: deliveryAddress,
    products: buildProductsSnapshot(products, dbProducts),
    metadata: {
      ...metadata,
      quantity: totalQuantity,
      state_order,
      subtotal_from_db: subtotalFromDb,
      subtotal_from_front: Number(amount) || null,
      client_date: date,
      pointOfSale,
    },
  });

  return {
    paymentIntent,
    wompiData: {
      reference: paymentIntent.wompi_reference,
      integritySignature,
      amountInCents,
      currency,
      amount: totalAmount,
    },
  };
}

async function setIntentStatus(paymentIntent, status, extra = {}, transaction) {
  return paymentIntent.update(
    {
      status,
      ...extra,
    },
    { transaction }
  );
}

async function finalizeApprovedIntent(paymentIntent, transactionPayload) {
  return conn.transaction(async (transaction) => {
    const intent = await PaymentIntent.findOne({
      where: { id_payment_intent: paymentIntent.id_payment_intent },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!intent) {
      throw new Error("PaymentIntent no encontrado durante la finalización");
    }

    if (intent.status === STATUS_MAP.APPROVED && intent.order_detail_id) {
      return { paymentIntent: intent, order: null };
    }

  const quantityFromMetadata = intent.metadata?.quantity;
  const baseAmount = intent.metadata?.subtotal_from_db ?? Number((intent.amount_in_cents / 100).toFixed(2));

    const orderData = {
      products: intent.products,
      amount: baseAmount,
      discount: intent.discount,
      shippingCost: intent.shipping_cost,
      quantity: quantityFromMetadata ?? intent.products.reduce((acc, product) => acc + Number(product.quantity || 0), 0),
      state_order: intent.metadata?.state_order || DEFAULT_STATE_ORDER,
      address: intent.address_type,
      deliveryAddress: intent.delivery_address,
      n_document: intent.customer_document,
      pointOfSale: "Online",
      date: intent.metadata?.client_date,
      orderId: intent.order_reference,
      transaction_status: "Aprobado",
    };

    const { order } = await createOrderWithProducts(orderData, {
      transaction,
    });

    const updatedIntent = await intent.update(
      {
        status: STATUS_MAP.APPROVED,
        wompi_transaction_id: transactionPayload.id,
        raw_transaction: transactionPayload,
        order_detail_id: order.id_orderDetail,
      },
      { transaction }
    );

    return { paymentIntent: updatedIntent, order };
  });
}

async function handleWompiEvent(eventPayload) {
  const { data } = eventPayload;
  const transaction = data?.transaction;

  if (!transaction) {
    throw new Error("Evento de Wompi inválido: falta transaction");
  }

  const intent = await PaymentIntent.findOne({
    where: { wompi_reference: transaction.reference },
  });

  if (!intent) {
    throw new Error(`No se encontró PaymentIntent con referencia ${transaction.reference}`);
  }

  const wompiStatus = STATUS_MAP[transaction.status] || STATUS_MAP.ERROR;

  if (wompiStatus === STATUS_MAP.APPROVED) {
    return finalizeApprovedIntent(intent, transaction);
  }

  const updatedIntent = await setIntentStatus(
    intent,
    wompiStatus,
    {
      wompi_transaction_id: transaction.id,
      raw_transaction: transaction,
    }
  );

  return { paymentIntent: updatedIntent, order: null };
}

async function listPaymentIntents(options = {}) {
  const {
    status,
    page = 1,
    limit = 20,
    search,
    fromDate,
    toDate,
  } = options;

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (currentPage - 1) * parsedLimit;

  const where = {};

  if (status) {
    const normalizedStatus = status.toUpperCase();
    if (Object.values(STATUS_MAP).includes(normalizedStatus)) {
      where.status = normalizedStatus;
    }
  }

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) {
      where.createdAt[Op.gte] = new Date(fromDate);
    }
    if (toDate) {
      where.createdAt[Op.lte] = new Date(toDate);
    }
  }

  if (search) {
    const likeValue = `%${search.trim()}%`;
    where[Op.or] = [
      { order_reference: { [Op.iLike]: likeValue } },
      { wompi_reference: { [Op.iLike]: likeValue } },
      { customer_document: { [Op.iLike]: likeValue } },
      { customer_email: { [Op.iLike]: likeValue } },
      { customer_name: { [Op.iLike]: likeValue } },
    ];
  }

  const { rows, count } = await PaymentIntent.findAndCountAll({
    where,
    limit: parsedLimit,
    offset,
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["raw_transaction"],
    },
  });

  const totalPages = Math.max(Math.ceil(count / parsedLimit), 1);

  return {
    paymentIntents: rows,
    pagination: {
      total: count,
      page: currentPage,
      pages: totalPages,
      limit: parsedLimit,
    },
  };
}

module.exports = {
  createPaymentIntent,
  handleWompiEvent,
  STATUS_MAP,
  listPaymentIntents,
};
