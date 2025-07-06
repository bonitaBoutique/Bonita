const { Receipt, Payment, Product, StockMovement, OrderDetail, Return, sequelize } = require("../../data");
const { v4: uuidv4 } = require('uuid');
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      original_receipt_id,
      returned_products,
      new_products = [],
      cashier_document,
      reason = '',
      customer_payment_method = 'Credito en tienda'
    } = req.body;

    console.log("🔄 Procesando devolución:", {
      original_receipt_id: parseInt(original_receipt_id),
      returned_products: returned_products?.length,
      new_products: new_products?.length,
      cashier_document,
      customer_payment_method
    });

    // ✅ VALIDACIONES INICIALES MEJORADAS
    if (!original_receipt_id) {
      await transaction.rollback();
      return response(res, 400, { 
        success: false,
        error: "ID de recibo original es requerido" 
      });
    }

    if (!returned_products || returned_products.length === 0) {
      await transaction.rollback();
      return response(res, 400, { 
        success: false,
        error: "Debe especificar productos para devolver" 
      });
    }

    if (!cashier_document) {
      await transaction.rollback();
      return response(res, 400, { 
        success: false,
        error: "Documento del cajero es requerido" 
      });
    }

    // ✅ PASO 1: Validar recibo original CON MEJOR INCLUDE
    const originalReceipt = await Receipt.findByPk(parseInt(original_receipt_id), {
      include: [{
        model: OrderDetail,
        include: [{
          model: Product,
          through: { 
            attributes: ['quantity', 'unit_price'] // ✅ INCLUIR PRECIO UNITARIO
          },
          as: 'products'
        }]
      }],
      transaction
    });

    if (!originalReceipt) {
      await transaction.rollback();
      return response(res, 404, { 
        success: false,
        error: "Recibo original no encontrado" 
      });
    }

    // ✅ PASO 2: VALIDAR QUE LOS PRODUCTOS DEVUELTOS ESTÉN EN EL RECIBO
    for (const returnItem of returned_products) {
      if (!returnItem.id_product || !returnItem.quantity || !returnItem.unit_price) {
        await transaction.rollback();
        return response(res, 400, { 
          success: false,
          error: "Datos incompletos en productos devueltos" 
        });
      }

      // Buscar el producto en el recibo original
      let foundInOriginal = false;
      if (originalReceipt.OrderDetails && originalReceipt.OrderDetails[0]?.products) {
        const originalProduct = originalReceipt.OrderDetails[0].products.find(
          p => p.id_product === returnItem.id_product
        );
        
        if (originalProduct) {
          const originalQuantity = originalProduct.OrderDetailProduct?.quantity || 0;
          if (returnItem.quantity > originalQuantity) {
            await transaction.rollback();
            return response(res, 400, { 
              success: false,
              error: `No se puede devolver más cantidad de la comprada para ${originalProduct.description}` 
            });
          }
          foundInOriginal = true;
        }
      }

      if (!foundInOriginal) {
        await transaction.rollback();
        return response(res, 400, { 
          success: false,
          error: `El producto ${returnItem.id_product} no está en el recibo original` 
        });
      }
    }

    // ✅ PASO 3: Procesar productos devueltos y actualizar stock
    let totalReturned = 0;
    const processedReturns = [];

    for (const returnItem of returned_products) {
      const product = await Product.findByPk(returnItem.id_product, { transaction });
      if (!product) {
        await transaction.rollback();
        return response(res, 404, { 
          success: false,
          error: `Producto ${returnItem.id_product} no encontrado` 
        });
      }

      // Actualizar stock (devolver al inventario)
      const newStock = product.stock + returnItem.quantity;
      await product.update({
        stock: newStock
      }, { transaction });

      // Registrar movimiento de stock
      await StockMovement.create({
        id_product: returnItem.id_product,
        quantity: returnItem.quantity,
        movement_type: 'entrada',
        reason: `Devolución - Recibo #${original_receipt_id} - ${returnItem.reason || reason}`,
        reference_id: original_receipt_id.toString(),
        date: new Date()
      }, { transaction });

      const itemTotal = returnItem.unit_price * returnItem.quantity;
      totalReturned += itemTotal;

      processedReturns.push({
        ...returnItem,
        product_name: product.description,
        itemTotal,
        newStock
      });

      console.log(`📦 Producto devuelto: ${product.description} | Cantidad: ${returnItem.quantity} | Nuevo stock: ${newStock}`);
    }

    // ✅ PASO 4: Procesar productos nuevos (si es cambio)
    let totalNewPurchase = 0;
    const processedNewProducts = [];

    if (new_products && new_products.length > 0) {
      for (const newItem of new_products) {
        if (!newItem.id_product || !newItem.quantity || !newItem.unit_price) {
          await transaction.rollback();
          return response(res, 400, { 
            success: false,
            error: "Datos incompletos en productos nuevos" 
          });
        }

        const product = await Product.findByPk(newItem.id_product, { transaction });
        if (!product) {
          await transaction.rollback();
          return response(res, 404, { 
            success: false,
            error: `Producto nuevo ${newItem.id_product} no encontrado` 
          });
        }

        // Validar stock disponible
        if (product.stock < newItem.quantity) {
          await transaction.rollback();
          return response(res, 400, { 
            success: false,
            error: `Stock insuficiente para ${product.description}. Disponible: ${product.stock}, solicitado: ${newItem.quantity}` 
          });
        }

        // Actualizar stock (restar del inventario)
        const newStock = product.stock - newItem.quantity;
        await product.update({
          stock: newStock
        }, { transaction });

        // Registrar movimiento de stock
        await StockMovement.create({
          id_product: newItem.id_product,
          quantity: -newItem.quantity,
          movement_type: 'salida',
          reason: `Cambio de producto - Recibo #${original_receipt_id}`,
          reference_id: original_receipt_id.toString(),
          date: new Date()
        }, { transaction });

        const itemTotal = newItem.unit_price * newItem.quantity;
        totalNewPurchase += itemTotal;

        processedNewProducts.push({
          ...newItem,
          product_name: product.description,
          itemTotal,
          newStock
        });

        console.log(`🛒 Producto nuevo: ${product.description} | Cantidad: ${newItem.quantity} | Nuevo stock: ${newStock}`);
      }
    }

    // ✅ PASO 5: Calcular diferencia y determinar acción
    const difference = totalNewPurchase - totalReturned;
    
    console.log("💰 Cálculos:", {
      totalReturned,
      totalNewPurchase,
      difference,
      scenario: difference > 0 ? 'Cliente debe pagar' : 
                difference < 0 ? 'Crédito a favor' : 'Intercambio exacto'
    });

    // ✅ PASO 6: Crear registro de devolución
    const returnId = uuidv4();
    const returnRecord = await Return.create({
      id_return: returnId,
      original_receipt_id: parseInt(original_receipt_id),
      return_date: new Date(),
      cashier_document,
      reason,
      status: 'Procesada',
      total_returned: totalReturned,
      total_new_purchase: totalNewPurchase,
      difference_amount: difference,
      returned_products: JSON.stringify(returned_products),
      new_products: JSON.stringify(new_products)
    }, { transaction });

    let newReceipt = null;
    let creditRecord = null;

    // ✅ PASO 7: Manejar diferentes escenarios según la diferencia
    if (difference > 0) {
      // Cliente debe pagar diferencia
      newReceipt = await createAdditionalPaymentReceipt({
        amount: difference,
        originalReceipt,
        returnRecord,
        customer_payment_method,
        new_products: processedNewProducts,
        transaction
      });
      
      returnRecord.new_receipt_id = newReceipt.id_receipt;
      await returnRecord.save({ transaction });

    } else if (difference < 0) {
      // Crédito a favor del cliente
      creditRecord = await createCustomerCredit({
        amount: Math.abs(difference),
        originalReceipt,
        returnRecord,
        transaction
      });
    }

    await transaction.commit();

    console.log("✅ Devolución procesada exitosamente:", {
      returnId,
      difference,
      newReceiptId: newReceipt?.id_receipt,
      creditId: creditRecord?.id
    });

    return response(res, 200, {
      success: true,
      message: 'Devolución procesada exitosamente',
      data: {
        return: returnRecord,
        difference,
        totalReturned,
        totalNewPurchase,
        processedReturns,
        processedNewProducts,
        newReceipt,
        creditRecord,
        customerInfo: {
          name: originalReceipt.buyer_name,
          email: originalReceipt.buyer_email,
          phone: originalReceipt.buyer_phone,
          document: originalReceipt.buyer_document
        },
        actionRequired: {
          type: difference > 0 ? 'additional_payment' : 
                difference < 0 ? 'credit_issued' : 'no_action',
          amount: Math.abs(difference),
          description: difference > 0 ? 'Cliente debe pagar diferencia' : 
                      difference < 0 ? 'Crédito emitido a favor del cliente' : 'Intercambio exacto'
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error procesando devolución:", error);
    return response(res, 500, { 
      success: false,
      error: "Error interno del servidor",
      details: error.message 
    });
  }
};

// ✅ FUNCIÓN PARA CREAR RECIBO ADICIONAL (Cliente debe pagar)
async function createAdditionalPaymentReceipt({ amount, originalReceipt, returnRecord, customer_payment_method, new_products, transaction }) {
  const receiptId = Date.now();
  
  const newReceipt = await Receipt.create({
    id_receipt: receiptId,
    buyer_name: originalReceipt.buyer_name,
    buyer_email: originalReceipt.buyer_email,
    buyer_phone: originalReceipt.buyer_phone,
    buyer_document: originalReceipt.buyer_document,
    date: new Date(),
    total_amount: amount,
    status: 'Pendiente pago',
    notes: `Diferencia por cambio de productos - Devolución ${returnRecord.id_return}`
  }, { transaction });

  // Crear el pago pendiente
  await Payment.create({
    id_receipt: receiptId,
    payment_method: customer_payment_method,
    amount: amount,
    status: 'Pendiente',
    payment_date: new Date()
  }, { transaction });

  console.log(`💳 Recibo adicional creado: ${receiptId} por $${amount}`);
  return newReceipt;
}

// ✅ FUNCIÓN PARA CREAR CRÉDITO AL CLIENTE
async function createCustomerCredit({ amount, originalReceipt, returnRecord, transaction }) {
  const creditRecord = await Payment.create({
    id_receipt: null,
    payment_method: 'Credito en tienda',
    amount: amount,
    status: 'Activo',
    payment_date: new Date(),
    notes: `Crédito por devolución ${returnRecord.id_return} - Cliente: ${originalReceipt.buyer_name}`,
    customer_document: originalReceipt.buyer_document
  }, { transaction });

  console.log(`🎁 Crédito creado: ${creditRecord.id} por $${amount} para ${originalReceipt.buyer_name}`);
  return creditRecord;
}