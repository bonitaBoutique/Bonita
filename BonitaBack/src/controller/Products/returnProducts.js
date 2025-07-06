const { Receipt, OrderDetail, Product, sequelize } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  // ✅ CREAR TRANSACCIÓN CORRECTAMENTE
  const transaction = await sequelize.transaction();
  
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
      await transaction.rollback();
      return response(res, 400, "error", {
        success: false,
        error: "ID de recibo original requerido"
      });
    }

    if (!cashier_document) {
      await transaction.rollback();
      return response(res, 400, "error", {
        success: false,
        error: "Documento de cajero requerido"
      });
    }

    if (!returned_products || returned_products.length === 0) {
      await transaction.rollback();
      return response(res, 400, "error", {
        success: false,
        error: "Debe especificar al menos un producto para devolver"
      });
    }

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
      await transaction.rollback();
      return response(res, 404, "error", {
        success: false,
        error: "Recibo original no encontrado"
      });
    }

    console.log("✅ Recibo original encontrado");

    // ✅ CALCULAR TOTALES
    let totalReturned = 0;
    let totalNewPurchase = 0;

    // Calcular total de productos devueltos
    for (const returnedProduct of returned_products) {
      const { id_product, quantity, unit_price } = returnedProduct;
      
      if (!id_product || !quantity || !unit_price) {
        await transaction.rollback();
        return response(res, 400, "error", {
          success: false,
          error: `Datos incompletos para producto ${id_product}`
        });
      }

      totalReturned += (unit_price * quantity);

      // ✅ ACTUALIZAR STOCK (devolver productos al inventario)
      console.log(`📦 Devolviendo ${quantity} unidades del producto ${id_product}`);
      
      await Product.increment('stock', {
        by: quantity,
        where: { id_product },
        transaction
      });
    }

    // Calcular total de productos nuevos
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
          error: `Producto ${id_product} no encontrado`
        });
      }

      if (product.stock < quantity) {
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
    }

    // ✅ CALCULAR DIFERENCIA
    const difference = totalNewPurchase - totalReturned;

    console.log("💰 Cálculos:", {
      totalReturned,
      totalNewPurchase,
      difference
    });

    let actionRequired = null;
    let newReceipt = null;

    // ✅ DETERMINAR ACCIÓN REQUERIDA
    if (difference > 0) {
      // Cliente debe pagar diferencia
      actionRequired = {
        type: 'additional_payment',
        amount: difference,
        message: `Cliente debe pagar diferencia de $${difference.toLocaleString("es-CO")}`
      };

      // ✅ CREAR NUEVO RECIBO PARA LA DIFERENCIA
      if (new_products.length > 0) {
        console.log("🧾 Creando nuevo recibo para productos nuevos...");
        
        // Obtener el siguiente número de recibo
        const lastReceipt = await Receipt.findOne({
          order: [['id_receipt', 'DESC']],
          transaction
        });
        
        const nextReceiptNumber = lastReceipt ? lastReceipt.id_receipt + 1 : 1001;

        // ✅ CREAR NUEVO ORDER DETAIL PARA LOS PRODUCTOS NUEVOS
        const newOrderDetail = await OrderDetail.create({
          date: new Date().toISOString().split('T')[0],
          quantity: new_products.reduce((sum, p) => sum + p.quantity, 0),
          amount: totalNewPurchase,
          shippingCost: 0,
          address: "Retira en Local",
          state_order: "Pedido Realizado",
          transaction_status: "Pendiente",
          pointOfSale: "Local",
          discount: 0,
          n_document: cashier_document
        }, { transaction });

        // ✅ CREAR NUEVO RECIBO
        newReceipt = await Receipt.create({
          id_receipt: nextReceiptNumber,
          cashier_document,
          buyer_name: originalReceipt.buyer_name || "Cliente",
          buyer_email: originalReceipt.buyer_email || "",
          buyer_phone: originalReceipt.buyer_phone || "",
          total_amount: difference, // Solo la diferencia que debe pagar
          payMethod: "Pendiente",
          amount: difference,
          date: new Date().toISOString().split('T')[0],
          id_orderDetail: newOrderDetail.id_orderDetail
        }, { transaction });

        console.log("✅ Nuevo recibo creado:", newReceipt.id_receipt);
      }

    } else if (difference < 0) {
      // Se debe emitir crédito al cliente
      actionRequired = {
        type: 'credit_issued',
        amount: Math.abs(difference),
        message: `Crédito emitido por $${Math.abs(difference).toLocaleString("es-CO")}`
      };
    } else {
      // Intercambio exacto
      actionRequired = {
        type: 'no_action',
        amount: 0,
        message: 'Intercambio sin diferencia de precio'
      };
    }

    // ✅ CONFIRMAR TRANSACCIÓN
    await transaction.commit();

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
    await transaction.rollback();
    
    console.error("💥 Error procesando devolución:", error);
    
    return response(res, 500, "error", {
      success: false,
      error: "Error interno del servidor",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};