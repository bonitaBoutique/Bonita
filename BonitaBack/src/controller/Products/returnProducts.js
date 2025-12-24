const { Receipt, OrderDetail, Product, GiftCard, StockMovement, Return, User, conn: sequelize } = require("../../data"); // ✅ Agregar Return y User
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
      difference_payment_method = "Efectivo", // ✅ NUEVO: Método de pago para la diferencia
      reason = "Devolución"
    } = req.body;

    console.log("💳 Método de pago para diferencia:", difference_payment_method);
    console.log("💳 Método de pago del cliente:", customer_payment_method);

    // ✅ VALIDACIONES BÁSICAS
    if (!original_receipt_id || !cashier_document || !returned_products.length) {
      await transaction.rollback();
      return response(res, 400, "error", {
        success: false,
        error: "Datos requeridos faltantes"
      });
    }

    // ✅ VALIDAR QUE EL CAJERO EXISTE EN LA BASE DE DATOS
    const cashierUser = await User.findOne({
      where: { n_document: cashier_document },
      attributes: ['n_document', 'first_name', 'last_name', 'role']
    });

    if (!cashierUser) {
      await transaction.rollback();
      return response(res, 400, "error", {
        success: false,
        error: `El documento del cajero '${cashier_document}' no existe en el sistema`,
        code: 'INVALID_CASHIER_DOCUMENT'
      });
    }

    console.log("👤 Cajero validado:", cashierUser.first_name, cashierUser.last_name);

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

      // 📝 REGISTRAR MOVIMIENTO DE STOCK - DEVOLUCIÓN
      await StockMovement.create({
        id_product,
        type: 'IN',
        quantity,
        reason: 'RETURN',
        reference_id: String(original_receipt_id), // ✅ Convertir a string
        reference_type: 'RETURN',
        unit_price,
        notes: `Devolución de producto del recibo ${original_receipt_id}`,
        date: getColombiaDate()
      }, { transaction });
      
      console.log(`✅ Stock devuelto para producto ${id_product}: +${quantity} unidades. Nuevo stock: ${product.stock + quantity}`);
      console.log(`📝 Movimiento de stock registrado: RETURN IN +${quantity}`);
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

      // 📝 REGISTRAR MOVIMIENTO DE STOCK - VENTA
      await StockMovement.create({
        id_product,
        type: 'OUT',
        quantity,
        reason: 'SALE',
        reference_id: String(original_receipt_id), // ✅ Convertir a string
        reference_type: 'RETURN',
        unit_price,
        notes: `Venta como parte del intercambio en devolución del recibo ${original_receipt_id}`,
        date: getColombiaDate()
      }, { transaction });
      
      console.log(`✅ Stock reducido para producto nuevo ${id_product}: -${quantity} unidades`);
      console.log(`📝 Movimiento de stock registrado: SALE OUT -${quantity}`);
    }

    // ✅ CALCULAR DIFERENCIA
    const difference = totalNewPurchase - totalReturned;

    console.log("💰 Cálculos finales:", {
      totalReturned,
      totalNewPurchase,
      difference
    });

    // 🔍 DEBUG ESPECÍFICO PARA LA CONDICIÓN
    console.log("🔍 DEBUG - Evaluando condiciones:");
    console.log("  difference > 0:", difference > 0);
    console.log("  difference < 0:", difference < 0); 
    console.log("  difference === 0:", difference === 0);
    console.log("  typeof difference:", typeof difference);
    console.log("🔍 DEBUG - Valor raw de difference:", difference);
    console.log("🔍 DEBUG - Comparación directa: ", difference, " > 0 = ", (difference > 0));

    let actionRequired = null;
    let newReceiptId = null;
    let newGiftCardId = null;

    console.log("🔍 DEBUG - ANTES del primer IF");

    if (difference > 0) {
      console.log("🔍 DEBUG - ENTRANDO AL IF (difference > 0)");
      // Cliente debe pagar diferencia - CREAR RECIBO
      console.log('💰 Cliente debe pagar diferencia:', difference);
      
      const receiptData = {
        cashier_document: cashier_document, // ✅ Usuario que procesa la devolución (del request)
        buyer_name: originalReceipt.buyer_name || 'Cliente', // ✅ Nombre del comprador original
        buyer_email: originalReceipt.buyer_email || 'no-email@bonita.com', // ✅ Email del comprador original
        buyer_phone: originalReceipt.buyer_phone || null,
        total_amount: difference, // ✅ Importe total
        amount: difference, // ✅ Importe del primer método de pago
        payMethod: difference_payment_method || 'Efectivo', // ✅ Método de pago seleccionado por el usuario
        date: getColombiaDate(),
        description: `Diferencia por devolución de productos (Recibo original: ${original_receipt_id})`
      };

      const newReceipt = await Receipt.create(receiptData, { transaction });
      newReceiptId = newReceipt.id_receipt; // ✅ CORREGIDO: usar id_receipt en lugar de id
      console.log('✅ Recibo de diferencia creado:', newReceiptId);

      actionRequired = {
        type: 'additional_payment',
        amount: difference,
        message: `Cliente debe pagar diferencia de $${difference.toLocaleString("es-CO")}`,
        receiptId: newReceiptId
      };

    } else if (difference < 0) {
      console.log("🔍 DEBUG - ENTRANDO AL ELSE IF (difference < 0)");
      // Cliente recibe crédito - CREAR GIFT CARD
      const creditAmount = Math.abs(difference);
      console.log('🎁 Cliente recibe crédito:', creditAmount);
      
      // ✅ PROTECCIÓN: Verificar si ya existe una GiftCard para esta devolución
      const existingGiftCard = await GiftCard.findOne({
        where: {
          reference_id: String(original_receipt_id),
          reference_type: 'RETURN_CREDIT'
        },
        transaction
      });

      if (existingGiftCard) {
        console.log('⚠️ Ya existe una GiftCard para esta devolución:', existingGiftCard.id_giftcard);
        newGiftCardId = existingGiftCard.id_giftcard;
        
        actionRequired = {
          type: 'credit_issued',
          amount: Math.abs(difference),
          message: `Crédito ya emitido por $${Math.abs(difference).toLocaleString("es-CO")}`,
          giftCardId: newGiftCardId,
          warning: 'GiftCard ya existía - no se creó duplicado'
        };
      } else {
        const giftCardData = {
          buyer_email: originalReceipt.buyer_email || 'no-email@bonita.com',
          buyer_name: originalReceipt.buyer_name || 'Cliente',
          buyer_phone: originalReceipt.buyer_phone || null,
          saldo: creditAmount,
          estado: 'activa',
          payment_method: 'Devolución', // ✅ AGREGAR: Método de pago para identificar origen
          description: `Crédito por devolución del recibo ${original_receipt_id}`,
          reference_id: String(original_receipt_id), // ✅ AGREGAR: Referencia al recibo original
          reference_type: 'RETURN_CREDIT' // ✅ AGREGAR: Tipo de referencia
        };

        const newGiftCard = await GiftCard.create(giftCardData, { transaction });
        newGiftCardId = newGiftCard.id_giftcard; // ✅ CORREGIDO: usar id_giftcard
        console.log('✅ Gift Card de crédito creada:', newGiftCardId);

        actionRequired = {
          type: 'credit_issued',
          amount: Math.abs(difference),
          message: `Crédito emitido por $${Math.abs(difference).toLocaleString("es-CO")}`,
          giftCardId: newGiftCardId
        };
      }

    } else {
      console.log("🔍 DEBUG - ENTRANDO AL ELSE (difference === 0)");
      actionRequired = {
        type: 'no_action',
        amount: 0,
        message: 'Intercambio sin diferencia de precio'
      };
    }

    console.log("🔍 DEBUG - DESPUÉS de todos los IFs");
    console.log("🔍 DEBUG - actionRequired final:", actionRequired);

    // ✅ CREAR REGISTRO DE DEVOLUCIÓN EN LA BASE DE DATOS
    console.log("💾 Creando registro de devolución...");
    
    // Generar ID único para la devolución
    const returnId = `RET-${original_receipt_id}-${Date.now()}`;
    
    const returnRecord = await Return.create({
      id_return: returnId,
      original_receipt_id: original_receipt_id,
      return_date: getColombiaDate(),
      cashier_document: cashier_document,
      reason: reason || "Devolución estándar",
      status: "Procesada",
      total_returned: totalReturned,
      total_new_purchase: totalNewPurchase,
      difference_amount: difference,
      new_receipt_id: newReceiptId, // ID del recibo creado para la diferencia (si aplica)
      returned_products: JSON.stringify(returned_products), // Guardar como JSON
      new_products: JSON.stringify(new_products) // Guardar como JSON
    }, { transaction });

    console.log("✅ Registro de devolución creado:", returnRecord.id_return);

    // ✅ CONFIRMAR TRANSACCIÓN
    await transaction.commit();
    console.log("✅ Transacción confirmada - Stock actualizado exitosamente");

    return response(res, 200, "success", {
      success: true,
      message: "Devolución procesada exitosamente",
      data: {
        returnId: returnRecord.id_return, // ✅ Agregar ID de devolución
        originalReceiptId: original_receipt_id,
        returnedProducts: returned_products,
        newProducts: new_products,
        calculations: {
          totalReturned,
          totalNewPurchase,
          difference
        },
        actionRequired,
        createdDocuments: {
          receiptId: newReceiptId,
          giftCardId: newGiftCardId
        },
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
    
    // ✅ Manejo específico de errores de llave foránea
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      if (error.constraint === 'Returns_cashier_document_fkey') {
        return response(res, 400, "error", {
          success: false,
          error: "El documento del cajero no existe en el sistema",
          details: `El documento '${error.value || 'desconocido'}' no está registrado como usuario válido`,
          code: 'INVALID_CASHIER_DOCUMENT'
        });
      }
    }
    
    return response(res, 500, "error", {
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
};