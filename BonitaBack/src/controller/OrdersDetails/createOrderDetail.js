const response = require("../../utils/response");
const { createOrderWithProducts } = require("../../services/orders/orderCreationService");

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
      discount = 0,
    } = req.body;

    if (pointOfSale === "Online") {
      return response(res, 400, {
        error: "Las órdenes en línea deben inicializarse desde /payments/wompi/init",
      });
    }

    const { order } = await createOrderWithProducts(
      {
        date,
        amount,
        quantity,
        state_order,
        products,
        address,
        deliveryAddress,
        shippingCost,
        n_document,
        pointOfSale,
        discount,
      },
      {}
    );

    return response(res, 201, { order });
  } catch (error) {
    console.error("❌ [CREATE ORDER] Error:", error);

    if (error.products) {
      return response(res, 400, {
        error: "Not enough stock for some products",
        productosSinStock: error.products,
      });
    }

    const errorMessage =
      error.name === "SequelizeValidationError"
        ? error.errors.map((e) => e.message).join(", ")
        : error.message;

    return response(res, 500, { error: errorMessage });
  }
};