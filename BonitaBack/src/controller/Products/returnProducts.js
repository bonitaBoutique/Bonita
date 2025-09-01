const { Receipt, OrderDetail, Product, conn: sequelize } = require("../../data");
const response = require("../../utils/response");
const { formatDateForDB, getColombiaDate } = require("../../utils/dateUtils"); // ✅ Importar utilidades de fecha

module.exports = async (req, res) => {
  console.log("🔍 DEBUG - Verificando imports...");
  console.log("Receipt:", typeof Receipt);
  console.log("OrderDetail:", typeof OrderDetail);
  console.log("Product:", typeof Product);
  console.log("sequelize (conn):", typeof sequelize);
  
  if (!sequelize || typeof sequelize.transaction !== 'function') {
    console.error("❌ ERROR: sequelize no disponible o transaction method missing");
    return response(res, 500, "error", {
      success: false,
      error: "Error de configuración del servidor"
    });
  }

  let transaction;
  
  try {
    transaction = await sequelize.transaction();
    console.log("✅ Transacción creada exitosamente");
  } catch (transactionError) {
    console.error("❌ Error creando transacción:", transactionError);
    return response(res, 500, "error", {
      success: false,
      error: "Error creando transacción de base de datos"
    });
  }
  
  try {
    const serverDate = getColombiaDate(); // ✅ Fecha del servidor para consistencia
    
    console.log("🔄 Iniciando procesamiento de devolución");
    console.log("📥 Datos recibidos:", JSON.stringify(req.body, null, 2));

    const {
      original_receipt_id,
      cashier_document,
      returned_products = [],
      new_products = [],
      customer_payment_method = "Credito en tienda",
      reason = "Devolución"
    } = req.body;

    // ✅ VALIDACIONES BÁSICAS
    if (!original_receipt_id || !cashier_document || !returned_products.length) {
      await transaction.rollback();
      return response(res, 400, "error", {
        success: false,
        error: "Datos requeridos faltantes"
      });
    }

    console.log("🔍 Buscando recibo original:", original_receipt_id);

    // ✅ BUSCAR RECIBO ORIGINAL CON PRODUCTOS Y CANTIDADES
    const originalReceipt = await Receipt.findByPk(original_receipt_id, {
      include: [{
        model: OrderDetail,
        as: 'OrderDetail', // Asegurar el alias correcto
        include: [{
          model: Product,
          as: 'products',
          through: { 
            attributes: ['quantity'], // Obtener la cantidad de la tabla intermedia
            as: 'ProductOrderDetail'
          }
        }]
      }],
      transaction
    });

    if (!originalReceipt) {
      await transaction.rollback();
      return response(res, 404, "error", {
        success: false,
        error: "Recibo original no encontrado"
      });
    }

    console.log("✅ Recibo original encontrado:", originalReceipt.id_receipt);
    console.log("🔍 DEBUG - Estructura del recibo:", JSON.stringify(originalReceipt, null, 2));
    
    // ✅ OBTENER PRODUCTOS DEL RECIBO ORIGINAL
    const originalProducts = originalReceipt.OrderDetail?.products || [];
    console.log("📦 Productos en recibo original:", originalProducts.length);
    console.log("🔍 DEBUG - Productos con cantidades:", originalProducts.map(p => ({
      id: p.id_product,
      name: p.description,
      quantity: p.ProductOrderDetail?.quantity,
      throughData: p.ProductOrderDetail
    })));
    
    // ✅ VALIDAR QUE LOS PRODUCTOS DEVUELTOS ESTÉN EN EL RECIBO ORIGINAL
    for (const returnedProduct of returned_products) {
      const { id_product, quantity } = returnedProduct;
      
      const originalProduct = originalProducts.find(p => p.id_product === id_product);
      
      if (!originalProduct) {
        console.log(`❌ Producto ${id_product} no está en el recibo original`);
        await transaction.rollback();
        return response(res, 400, "error", {
          success: false,
          error: `Producto ${id_product} no está en el recibo original`
        });
      }
      
      // ✅ MEJORAR: Intentar múltiples formas de obtener la cantidad
      let originalQuantity = 0;
      
      // Método 1: A través de ProductOrderDetail
      if (originalProduct.ProductOrderDetail?.quantity) {
        originalQuantity = originalProduct.ProductOrderDetail.quantity;
        console.log(`📊 Cantidad obtenida vía ProductOrderDetail: ${originalQuantity}`);
      }
      // Método 2: A través de through (tabla intermedia)
      else if (originalProduct.dataValues?.ProductOrderDetail?.quantity) {
        originalQuantity = originalProduct.dataValues.ProductOrderDetail.quantity;
        console.log(`📊 Cantidad obtenida vía dataValues: ${originalQuantity}`);
      }
      // Método 3: Buscar directamente en OrderDetail si existe quantity
      else if (originalProduct.quantity) {
        originalQuantity = originalProduct.quantity;
        console.log(`📊 Cantidad obtenida directamente: ${originalQuantity}`);
      }
      
      console.log(`🔍 Producto ${id_product}: cantidad original = ${originalQuantity}, cantidad a devolver = ${quantity}`);
      
      if (quantity > originalQuantity) {
        console.log(`❌ Cantidad a devolver (${quantity}) mayor que la original (${originalQuantity}) para producto ${id_product}`);
        await transaction.rollback();
        return response(res, 400, "error", {
          success: false,
          error: `No puede devolver ${quantity} unidades del producto ${id_product}. Cantidad original: ${originalQuantity}`
        });
      }
    }

    let totalReturned = 0;
    let totalNewPurchase = 0;

    console.log("💰 Procesando productos devueltos:", returned_products.length);

    // ✅ PROCESAR PRODUCTOS DEVUELTOS
    for (const returnedProduct of returned_products) {
      const { id_product, quantity, unit_price } = returnedProduct;
      
      console.log(`📝 Devolviendo producto: ${id_product}, qty: ${quantity}, price: ${unit_price}`);
      
      if (!id_product || !quantity || !unit_price) {
        await transaction.rollback();
        return response(res, 400, "error", {
          success: false,
          error: `Datos incompletos para producto devuelto ${id_product}`
        });
      }

      totalReturned += (unit_price * quantity);
      
      // ✅ VERIFICAR QUE EL PRODUCTO EXISTE ANTES DE ACTUALIZAR STOCK
      const product = await Product.findByPk(id_product, { transaction });
      
      if (!product) {
        console.log(`❌ Producto ${id_product} no encontrado en base de datos`);
        await transaction.rollback();
        return response(res, 404, "error", {
          success: false,
          error: `Producto ${id_product} no encontrado`
        });
      }

      console.log(`📦 Stock actual del producto ${id_product}: ${product.stock}`);
      
      // ✅ DEVOLVER PRODUCTOS AL INVENTARIO
      const updatedProduct = await Product.increment('stock', {
        by: quantity,
        where: { id_product },
        transaction,
        returning: true, // ✅ Obtener el resultado actualizado
        plain: true
      });
      
      console.log(`✅ Stock devuelto para producto ${id_product}: +${quantity} unidades. Nuevo stock: ${product.stock + quantity}`);
    }

    // ✅ PROCESAR PRODUCTOS NUEVOS (si los hay)
    for (const newProduct of new_products) {
      const { id_product, quantity, unit_price } = newProduct;
      
      if (!id_product || !quantity || !unit_price) {
        await transaction.rollback();
        return response(res, 400, "error", {
          success: false,
          error: `Datos incompletos para producto nuevo ${id_product}`
        });
      }

      totalNewPurchase += (unit_price * quantity);

      // ✅ VERIFICAR STOCK DISPONIBLE
      const product = await Product.findByPk(id_product, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return response(res, 404, "error", {
          success: false,
          error: `Producto nuevo ${id_product} no encontrado`
        });
      }

      if (product.stock < quantity) {
        await transaction.rollback();
        return response(res, 400, "error", {
          success: false,
          error: `Stock insuficiente para producto ${id_product}. Disponible: ${product.stock}, Solicitado: ${quantity}`
        });
      }

      // ✅ REDUCIR STOCK PARA PRODUCTOS NUEVOS
      await Product.decrement('stock', {
        by: quantity,
        where: { id_product },
        transaction
      });
      
      console.log(`✅ Stock reducido para producto nuevo ${id_product}: -${quantity} unidades`);
    }

    // ✅ CALCULAR DIFERENCIA
    const difference = totalNewPurchase - totalReturned;

    console.log("💰 Cálculos finales:", {
      totalReturned,
      totalNewPurchase,
      difference
    });

    let actionRequired = null;

    if (difference > 0) {
      actionRequired = {
        type: 'additional_payment',
        amount: difference,
        message: `Cliente debe pagar diferencia de $${difference.toLocaleString("es-CO")}`
      };
    } else if (difference < 0) {
      actionRequired = {
        type: 'credit_issued',
        amount: Math.abs(difference),
        message: `Crédito emitido por $${Math.abs(difference).toLocaleString("es-CO")}`
      };
    } else {
      actionRequired = {
        type: 'no_action',
        amount: 0,
        message: 'Intercambio sin diferencia de precio'
      };
    }

    // ✅ CONFIRMAR TRANSACCIÓN
    await transaction.commit();
    console.log("✅ Transacción confirmada - Stock actualizado exitosamente");

    return response(res, 200, "success", {
      success: true,
      message: "Devolución procesada exitosamente",
      data: {
        originalReceiptId: original_receipt_id,
        returnedProducts: returned_products,
        newProducts: new_products,
        calculations: {
          totalReturned,
          totalNewPurchase,
          difference
        },
        actionRequired,
        stockUpdated: true,
        processedAt: formatDateForDB(serverDate),
        serverInfo: {
          serverDate,
          timezone: 'America/Bogota'
        }
      }
    });

  } catch (error) {
    console.error("💥 Error durante el procesamiento:", error);
    
    if (transaction) {
      try {
        await transaction.rollback();
        console.log("🔄 Rollback ejecutado exitosamente");
      } catch (rollbackError) {
        console.error("💥 Error en rollback:", rollbackError);
      }
    }
    
    return response(res, 500, "error", {
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
};