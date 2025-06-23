const { OrderDetail, Product, StockMovement } = require("../../data");
const response = require("../../utils/response");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { formatDateForDB } = require("../../utils/dateUtils");
const secretoIntegridad = "prod_integrity_LpUoK811LHCRNykBpQQp67JwmjESi7OD";

function generarFirmaIntegridad(referencia, montoEnCentavos, moneda, secretoIntegridad) {
  const cadenaConcatenada = `${referencia}${montoEnCentavos}${moneda}${secretoIntegridad}`;
  console.log("Cadena para firma:", cadenaConcatenada);
  return crypto.createHash("sha256").update(cadenaConcatenada).digest("hex");
}

module.exports = async (req, res) => {
  try {
    console.log('🟣 [BACK] Body recibido para crear reserva:', req.body);
    console.log('🟣 [BACK] Params:', req.params);
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
      discount = 0
    } = req.body;

    // ✅ Log para debug de fecha
    console.log("Fecha recibida del frontend:", date);
    console.log("Fecha después de formatDateForDB:", formatDateForDB(date));

    // Validaciones
    if (!date || !amount || !quantity || !state_order || !products || !address) {
      return response(res, 400, { error: "Missing Ordering Data" });
    }
    
    if (!["Local", "Online", "Coordinar por WhatsApp"].includes(pointOfSale)) {
      return response(res, 400, { error: "Invalid pointOfSale value" });
    }
    
    if (amount <= 0 || quantity <= 0 || !Array.isArray(products) || products.length === 0) {
      return response(res, 400, { error: "Invalid Ordering Data" });
    }

    // ✅ Validar que la fecha no sea futura
    const dateToSave = formatDateForDB(date);
    const today = new Date().toISOString().split('T')[0];
    
    if (dateToSave > today) {
      return response(res, 400, { 
        error: "Future dates are not allowed", 
        providedDate: dateToSave, 
        maxDate: today 
      });
    }

    const totalAmount = Math.max(0, Number(amount) - Number(discount) + Number(shippingCost));
    const amountInCents = Math.round(totalAmount * 100);

    // Verificación de stock
    const productIds = products.map(p => p.id_product);
    const dbProducts = await Product.findAll({ 
      where: { id_product: productIds }, 
      attributes: ["id_product", "stock", "isDian"] 
    });
    
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

    const isFacturable = dbProducts.some(product => product.isDian);
    const finalDeliveryAddress = address === "Envio a domicilio" ? deliveryAddress : null;

    // Generar ID y Firma
    const newOrderId = uuidv4();
    const firmaReal = generarFirmaIntegridad(
      newOrderId,
      amountInCents,
      "COP",
      secretoIntegridad
    );

    console.log("ID generado:", newOrderId);
    console.log("Firma generada:", firmaReal);
    console.log("Datos para crear orden:", {
      id_orderDetail: newOrderId,
      date: dateToSave,
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

    // ✅ Crear la orden con datos explícitos
    const orderDetail = await OrderDetail.create({
      id_orderDetail: newOrderId,
      date: dateToSave, // Fecha explícita
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
      // ✅ No especificar createdAt/updatedAt - que Sequelize los maneje automáticamente
    });

    // Asociar productos y actualizar stock
    await Promise.all(
      products.map(async (product) => {
        await StockMovement.create({ 
          id_movement: uuidv4(), 
          id_product: product.id_product, 
          type: "OUT", 
          quantity: product.quantity 
        });
        await Product.decrement("stock", { 
          by: product.quantity, 
          where: { id_product: product.id_product } 
        });
        await orderDetail.addProduct(product.id_product, { 
          through: { quantity: product.quantity } 
        });
      })
    );

    // Obtener la orden actualizada
    const updatedOrderDetail = await OrderDetail.findOne({
      where: { id_orderDetail: orderDetail.id_orderDetail },
      include: { 
        model: Product, 
        as: "products", 
        attributes: ["id_product", "stock", "description", "price"] 
      },
    });

    console.log("Orden creada exitosamente:", updatedOrderDetail.toJSON());

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

    console.log("Enviando respuesta:", responseData);
    return response(res, 201, responseData);

  } catch (error) {
    console.error("Error completo creating orderDetail:", error);
    console.error("Stack trace:", error.stack);
    
    // Manejo específico de errores de Sequelize
    if (error.name === 'SequelizeValidationError') {
      return response(res, 400, { 
        error: "Validation Error", 
        details: error.errors.map(e => ({
          field: e.path,
          message: e.message,
          value: e.value
        }))
      });
    }
    
    if (error.name === 'SequelizeDatabaseError') {
      return response(res, 500, { 
        error: "Database Error", 
        message: error.message,
        // ✅ No exponer detalles internos en producción
        details: process.env.NODE_ENV === 'development' ? error.parent : undefined
      });
      
    }
    
   
      return response(res, 500, { error: error.message, details: error.errors || null });
    };
  }
  return response(res, 500, { error: "Internal Server Error" });