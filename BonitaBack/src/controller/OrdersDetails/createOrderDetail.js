const { OrderDetail, Product, StockMovement } = require("../../data");
const response = require("../../utils/response");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const secretoIntegridad = "prod_integrity_LpUoK811LHCRNykBpQQp67JwmjESi7OD";

function generarFirmaIntegridad(id_orderDetail, monto, moneda, secretoIntegridad) {
  const cadenaConcatenada = `${id_orderDetail}${monto}${moneda}${secretoIntegridad}`;
  return crypto.createHash("sha256").update(cadenaConcatenada).digest("hex");
}

module.exports = async (req, res) => {
  try {
    const { 
      date, 
      amount,
      quantity,
      state_order,
      products, // Array de objetos con id_product y quantity
      address,
      deliveryAddress,
      shippingCost = 0,
      n_document,
      pointOfSale 
    } = req.body;

    // Validación de datos requeridos
    if (!date || !amount || !quantity || !state_order || !products || !address) {
      return response(res, 400, { error: "Missing Ordering Data" });
    }

    // Validación de pointOfSale
    if (!["Local", "Online"].includes(pointOfSale)) {
      return response(res, 400, { error: "Invalid pointOfSale value" });
    }

    // Validación adicional de datos
    if (amount <= 0 || quantity <= 0 || !Array.isArray(products) || products.length === 0) {
      return response(res, 400, { error: "Invalid Ordering Data" });
    }

    const totalAmount = Number(amount) + Number(shippingCost);

    // Verificar el stock de los productos
    const productIds = products.map(p => p.id_product);
    const dbProducts = await Product.findAll({
      where: { id_product: productIds },
      attributes: ["id_product", "stock", "isDian"],
    });

    // Verificar stock disponible
    const productosSinStock = dbProducts.filter((dbProduct) => {
      const ordenProducto = products.find(p => p.id_product === dbProduct.id_product);
      return dbProduct.stock < ordenProducto.quantity;
    });

    if (productosSinStock.length > 0) {
      return response(res, 400, { 
        error: "Not enough stock for some products", 
        productosSinStock 
      });
    }

    const referencia = `SO-${uuidv4()}`;
    const integritySignature = generarFirmaIntegridad(
      referencia, 
      totalAmount * 100, 
      "COP", 
      secretoIntegridad
    );

    const isFacturable = dbProducts.some(product => product.isDian);
    const finalDeliveryAddress = address === "Envio a domicilio" ? deliveryAddress : null;

    // Crear la orden
    const orderDetail = await OrderDetail.create({
      id_orderDetail: uuidv4(),
      date,
      amount: totalAmount,
      shippingCost,
      quantity,
      state_order,
      address,
      deliveryAddress: finalDeliveryAddress,
      n_document,
      pointOfSale,
      integritySignature,
      isFacturable
    });

    // Asociar productos y actualizar stock
    await Promise.all(
      products.map(async (product) => {
        // Registrar movimiento de stock
        await StockMovement.create({
          id_movement: uuidv4(),
          id_product: product.id_product,
          type: "OUT",
          quantity: product.quantity,
        });

        // Actualizar el stock del producto
        await Product.decrement("stock", {
          by: product.quantity,
          where: { id_product: product.id_product },
        });

        // Asociar producto con la orden
        await orderDetail.addProduct(product.id_product, { 
          through: { quantity: product.quantity } 
        });
      })
    );

    // Obtener la orden actualizada con los productos
    const updatedOrderDetail = await OrderDetail.findOne({
      where: { id_orderDetail: orderDetail.id_orderDetail },
      include: {
        model: Product,
        as: "products",
        attributes: ["id_product", "stock", "description", "price"],
      },
    });

    // Logs para depuración
    console.log("Creando orden con los siguientes datos:", {
      date,
      amount: totalAmount,
      pointOfSale,
      products,
      address,
      deliveryAddress: finalDeliveryAddress
    });
    console.log("Orden creada:", updatedOrderDetail);

    const responseData = { 
      orderDetail: updatedOrderDetail
    };

    if (pointOfSale === "Online") {
      responseData.wompiData = {
        referencia,
        integritySignature,
        amount: totalAmount * 100 // Amount in cents for Wompi
      };
    }

    return response(res, 201, responseData);

  } catch (error) {
    console.error("Error creating orderDetail:", error);
    return response(res, 500, { error: error.message });
  }
};