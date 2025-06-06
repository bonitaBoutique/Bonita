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
      customer_payment_method = 'Credito en tienda' // ✅ Cambiar default (ya no efectivo)
    } = req.body;

    console.log("🔄 Procesando devolución:", {
      original_receipt_id: parseInt(original_receipt_id),
      returned_products: returned_products?.length,
      new_products: new_products?.length,
      cashier_document,
      customer_payment_method
    });

    // ✅ VALIDACIONES INICIALES
    if (!returned_products || returned_products.length === 0) {
      await transaction.rollback();
      return response(res, 400, { error: "Debe especificar productos para devolver" });
    }

    // ✅ PASO 1: Validar recibo original
    const originalReceipt = await Receipt.findByPk(parseInt(original_receipt_id), {
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
      return response(res, 404, { error: "Recibo original no encontrado" });
    }

    // ✅ PASO 2: Procesar productos devueltos y actualizar stock
    let totalReturned = 0;
    for (const returnItem of returned_products) {
      const product = await Product.findByPk(returnItem.id_product, { transaction });
      if (!product) {
        await transaction.rollback();
        return response(res, 404, { error: `Producto ${returnItem.id_product} no encontrado` });
      }

      // Actualizar stock (devolver al inventario)
      await product.update({
        stock: product.stock + returnItem.quantity
      }, { transaction });

      // Registrar movimiento de stock
      await StockMovement.create({
        id_product: returnItem.id_product,
        quantity: returnItem.quantity,
        movement_type: 'entrada',
        reason: `Devolución - ${returnItem.reason}`,
        reference_id: original_receipt_id.toString(),
        date: new Date()
      }, { transaction });

      totalReturned += returnItem.unit_price * returnItem.quantity;
    }

    // ✅ PASO 3: Procesar productos nuevos (si es cambio)
    let totalNewPurchase = 0;
    if (new_products && new_products.length > 0) {
      for (const newItem of new_products) {
        const product = await Product.findByPk(newItem.id_product, { transaction });
        if (!product) {
          await transaction.rollback();
          return response(res, 404, { error: `Producto nuevo ${newItem.id_product} no encontrado` });
        }

        if (product.stock < newItem.quantity) {
          await transaction.rollback();
          return response(res, 400, { error: `Stock insuficiente para ${product.description}` });
        }

        // Actualizar stock (restar del inventario)
        await product.update({
          stock: product.stock - newItem.quantity
        }, { transaction });

        // Registrar movimiento de stock
        await StockMovement.create({
          id_product: newItem.id_product,
          quantity: -newItem.quantity,
          movement_type: 'salida',
          reason: 'Cambio de producto',
          reference_id: original_receipt_id.toString(),
          date: new Date()
        }, { transaction });

        totalNewPurchase += newItem.unit_price * newItem.quantity;
      }
    }

    // ✅ PASO 4: Calcular diferencia
    const difference = totalNewPurchase - totalReturned;

    // ✅ PASO 5: Crear registro de devolución
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

    // ✅ PASO 6: Solo crear recibo adicional si cliente debe dinero
    if (difference > 0) {
      newReceipt = await createAdditionalPaymentReceipt({
        amount: difference,
        originalReceipt,
        returnRecord,
        customer_payment_method,
        new_products,
        transaction
      });
      
      returnRecord.new_receipt_id = newReceipt.id_receipt;
      await returnRecord.save({ transaction });
    }

    await transaction.commit();

    console.log("✅ Devolución procesada exitosamente:", {
      returnId,
      difference,
      newReceiptId: newReceipt?.id_receipt
    });

    return response(res, 200, {
      success: true, // ✅ Agregar success flag
      message: 'Devolución procesada exitosamente',
      data: {
        return: returnRecord,
        difference,
        totalReturned,
        totalNewPurchase,
        newReceipt,
        customerInfo: {
          name: originalReceipt.buyer_name,
          email: originalReceipt.buyer_email,
          phone: originalReceipt.buyer_phone
        },
        actionRequired: {
          type: difference > 0 ? 'additional_payment' : 
                difference < 0 ? 'create_giftcard' : 'no_action',
          amount: Math.abs(difference),
          description: difference > 0 ? 'Cliente debe pagar diferencia' : 
                      difference < 0 ? 'Crear GiftCard para saldo a favor' : 'Intercambio exacto'
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error procesando devolución:", error);
    return response(res, 500, { 
      success: false, // ✅ Agregar success flag
      error: "Error interno del servidor",
      details: error.message 
    });
  }
};

// ✅ FUNCIÓN HELPER PARA CREAR RECIBO ADICIONAL
async function createAdditionalPaymentReceipt({ amount, originalReceipt, returnRecord, customer_payment_method, new_products, transaction }) {
  const receiptId = Date.now(); // Usar timestamp como ID único
  
  const newReceipt = await Receipt.create({
    id_receipt: receiptId,
    buyer_name: originalReceipt.buyer_name,
    buyer_email: originalReceipt.buyer_email,
    buyer_phone: originalReceipt.buyer_phone,
    buyer_document: originalReceipt.buyer_document,
    date: new Date(),
    total_amount: amount,
    status: 'Pendiente pago' // Cliente debe pagar
  }, { transaction });

  // Crear el pago pendiente
  await Payment.create({
    id_receipt: receiptId,
    payment_method: customer_payment_method,
    amount: amount,
    status: 'Pendiente',
    payment_date: new Date()
  }, { transaction });

  return newReceipt;
}

