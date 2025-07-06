const { Receipt, OrderDetail, Product, conn: sequelize } = require("../../data");
// ✅ CAMBIO: Importar 'conn' y renombrarlo a 'sequelize'
const response = require("../../utils/response");

module.exports = async (req, res) => {
  // ✅ DEBUGGING DETALLADO
  console.log("🔍 DEBUG - Verificando imports...");
  console.log("Receipt:", typeof Receipt);
  console.log("OrderDetail:", typeof OrderDetail);
  console.log("Product:", typeof Product);
  console.log("sequelize (conn):", typeof sequelize);
  console.log("sequelize object:", sequelize ? "OK" : "UNDEFINED");
  
  // ✅ VERIFICAR SI SEQUELIZE ESTÁ DISPONIBLE
  if (!sequelize) {
    console.error("❌ ERROR: sequelize (conn) is undefined");
    return response(res, 500, "error", {
      success: false,
      error: "Error de configuración del servidor - sequelize no disponible"
    });
  }

  if (typeof sequelize.transaction !== 'function') {
    console.error("❌ ERROR: sequelize.transaction is not a function");
    console.log("sequelize methods:", Object.keys(sequelize));
    return response(res, 500, "error", {
      success: false,
      error: "Error de configuración del servidor - transaction method no disponible"
    });
  }

  console.log("✅ sequelize está disponible, creando transacción...");
  
  let transaction;
  
  try {
    // ✅ CREAR TRANSACCIÓN CON MANEJO DE ERRORES
    transaction = await sequelize.transaction();
    console.log("✅ Transacción creada exitosamente:", typeof transaction);
  } catch (transactionError) {
    console.error("❌ Error creando transacción:", transactionError);
    return response(res, 500, "error", {
      success: false,
      error: "Error creando transacción de base de datos",
      details: transactionError.message
    });
  }
  
  try {
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
    if (!original_receipt_id) {
      console.log("❌ Validación fallida: No hay original_receipt_id");
      await transaction.rollback();
      return response(res, 400, "error", {
        success: false,
        error: "ID de recibo original requerido"
      });
    }

    if (!cashier_document) {
      console.log("❌ Validación fallida: No hay cashier_document");
      await transaction.rollback();
      return response(res, 400, "error", {
        success: false,
        error: "Documento de cajero requerido"
      });
    }

    if (!returned_products || returned_products.length === 0) {
      console.log("❌ Validación fallida: No hay returned_products");
      await transaction.rollback();
      return response(res, 400, "error", {
        success: false,
        error: "Debe especificar al menos un producto para devolver"
      });
    }

    console.log("✅ Validaciones básicas pasadas");
    console.log("🔍 Buscando recibo original:", original_receipt_id);

    // ✅ BUSCAR RECIBO ORIGINAL
    const originalReceipt = await Receipt.findByPk(original_receipt_id, {
      include: [{
        model: OrderDetail,
        include: [{
          model: Product,
          through: { attributes: ['quantity'] },
          as: 'products'
        }]
      }],
      transaction
    });

    if (!originalReceipt) {
      console.log("❌ Recibo original no encontrado");
      await transaction.rollback();
      return response(res, 404, "error", {
        success: false,
        error: "Recibo original no encontrado"
      });
    }

    console.log("✅ Recibo original encontrado:", originalReceipt.id_receipt);

    // ✅ CALCULAR TOTALES
    let totalReturned = 0;
    let totalNewPurchase = 0;

    console.log("💰 Procesando productos devueltos:", returned_products.length);

    // Calcular total de productos devueltos
    for (const returnedProduct of returned_products) {
      const { id_product, quantity, unit_price } = returnedProduct;
      
      console.log(`📝 Procesando producto devuelto: ${id_product}, qty: ${quantity}, price: ${unit_price}`);
      
      if (!id_product || !quantity || !unit_price) {
        console.log("❌ Datos incompletos para producto devuelto:", returnedProduct);
        await transaction.rollback();
        return response(res, 400, "error", {
          success: false,
          error: `Datos incompletos para producto ${id_product}`
        });
      }

      totalReturned += (unit_price * quantity);
      console.log(`📦 Devolviendo ${quantity} unidades del producto ${id_product}`);
      
      // ✅ ACTUALIZAR STOCK (devolver productos al inventario)
      await Product.increment('stock', {
        by: quantity,
        where: { id_product },
        transaction
      });
      
      console.log(`✅ Stock incrementado para producto ${id_product}`);
    }

    console.log("💰 Procesando productos nuevos:", new_products.length);

    // Calcular total de productos nuevos
    for (const newProduct of new_products) {
      const { id_product, quantity, unit_price } = newProduct;
      
      console.log(`📝 Procesando producto nuevo: ${id_product}, qty: ${quantity}, price: ${unit_price}`);
      
      if (!id_product || !quantity || !unit_price) {
        console.log("❌ Datos incompletos para producto nuevo:", newProduct);
        await transaction.rollback();
        return response(res, 400, "error", {
          success: false,
          error: `Datos incompletos para producto nuevo ${id_product}`
        });
      }

      totalNewPurchase += (unit_price * quantity);

      // ✅ VERIFICAR STOCK DISPONIBLE
      console.log(`🔍 Verificando stock para producto ${id_product}`);
      const product = await Product.findByPk(id_product, { transaction });
      
      if (!product) {
        console.log(`❌ Producto no encontrado: ${id_product}`);
        await transaction.rollback();
        return response(res, 404, "error", {
          success: false,
          error: `Producto ${id_product} no encontrado`
        });
      }

      console.log(`📦 Stock actual del producto ${id_product}: ${product.stock}`);

      if (product.stock < quantity) {
        console.log(`❌ Stock insuficiente para ${id_product}. Disponible: ${product.stock}, Solicitado: ${quantity}`);
        await transaction.rollback();
        return response(res, 400, "error", {
          success: false,
          error: `Stock insuficiente para producto ${id_product}. Disponible: ${product.stock}, Solicitado: ${quantity}`
        });
      }

      // ✅ REDUCIR STOCK
      console.log(`📤 Reduciendo ${quantity} unidades del producto ${id_product}`);
      
      await Product.decrement('stock', {
        by: quantity,
        where: { id_product },
        transaction
      });
      
      console.log(`✅ Stock decrementado para producto ${id_product}`);
    }

    // ✅ CALCULAR DIFERENCIA
    const difference = totalNewPurchase - totalReturned;

    console.log("💰 Cálculos finales:", {
      totalReturned,
      totalNewPurchase,
      difference
    });

    let actionRequired = null;
    let newReceipt = null;

    // ✅ DETERMINAR ACCIÓN REQUERIDA
    if (difference > 0) {
      console.log("💳 Cliente debe pagar diferencia");
      actionRequired = {
        type: 'additional_payment',
        amount: difference,
        message: `Cliente debe pagar diferencia de $${difference.toLocaleString("es-CO")}`
      };
    } else if (difference < 0) {
      console.log("🎁 Se debe emitir crédito al cliente");
      actionRequired = {
        type: 'credit_issued',
        amount: Math.abs(difference),
        message: `Crédito emitido por $${Math.abs(difference).toLocaleString("es-CO")}`
      };
    } else {
      console.log("🔄 Intercambio exacto sin diferencia");
      actionRequired = {
        type: 'no_action',
        amount: 0,
        message: 'Intercambio sin diferencia de precio'
      };
    }

    // ✅ CONFIRMAR TRANSACCIÓN
    console.log("💾 Confirmando transacción...");
    await transaction.commit();
    console.log("✅ Transacción confirmada exitosamente");

    console.log("✅ Devolución procesada exitosamente");

    // ✅ RESPUESTA EXITOSA
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
        newReceipt: newReceipt ? {
          id_receipt: newReceipt.id_receipt,
          total_amount: newReceipt.total_amount,
          date: newReceipt.date
        } : null,
        stockUpdated: true,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    // ✅ ROLLBACK EN CASO DE ERROR
    console.error("💥 Error durante el procesamiento:", error);
    console.error("💥 Stack trace:", error.stack);
    
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
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};