const { Receipt, OrderDetail, Product, Return } = require("../../data"); // ✅ Agregar Return
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { receipt_id } = req.params;

    console.log("🔍 Buscando recibo para devolución:", receipt_id);

    // ✅ VERIFICAR SI EL RECIBO YA TIENE DEVOLUCIONES REGISTRADAS
    const existingReturns = await Return.findAll({
      where: { original_receipt_id: receipt_id }
    });

    console.log("🔍 Devoluciones existentes para este recibo:", existingReturns.length);

    const receipt = await Receipt.findByPk(receipt_id, {
      include: [{
        model: OrderDetail,
        include: [{
          model: Product,
          through: { 
            // ✅ CAMBIO: Solo incluir columnas que existen
            attributes: ['quantity'] // Remover 'unit_price' si no existe
          },
          as: 'products',
          attributes: [
            'id_product', 
            'description', 
            'priceSell', 
            'stock', 
            'marca', 
            'codigoBarra',
            'sizes',
            'colors'
          ]
        }]
      }]
    });

    if (!receipt) {
      console.log("❌ Recibo no encontrado:", receipt_id);
      return response(res, 404, "error", {
        success: false,
        error: "Recibo no encontrado",
        details: `No se encontró el recibo con ID: ${receipt_id}`
      });
    }

    console.log("✅ Recibo encontrado:", receipt.id_receipt);

    // ✅ TRANSFORMAR LA RESPUESTA para que coincida con el frontend
    const transformedReceipt = {
      id_receipt: receipt.id_receipt,
      cashier_document: receipt.cashier_document,
      buyer_name: receipt.buyer_name,
      buyer_email: receipt.buyer_email,
      buyer_phone: receipt.buyer_phone,
      totalAmount: receipt.total_amount,
      paymentMethod: receipt.payMethod,
      date: receipt.date,
      products: receipt.OrderDetail?.products?.map(product => {
        // ✅ CALCULAR CANTIDAD DISPONIBLE PARA DEVOLUCIÓN
        let availableQuantity = product.ProductOrderDetail?.quantity || 
                               product.dataValues?.ProductOrderDetail?.quantity || 
                               product.through?.quantity || 1;

        // ✅ RESTAR CANTIDADES YA DEVUELTAS
        existingReturns.forEach(returnRecord => {
          try {
            const returnedProducts = JSON.parse(returnRecord.returned_products || '[]');
            const returnedProduct = returnedProducts.find(p => p.id_product === product.id_product);
            if (returnedProduct) {
              availableQuantity -= returnedProduct.quantity;
            }
          } catch (error) {
            console.log("⚠️ Error parseando returned_products:", error);
          }
        });

        console.log(`📊 Producto ${product.id_product}: cantidad original = ${product.ProductOrderDetail?.quantity || 1}, disponible = ${availableQuantity}`);

        return {
          product: {
            id_product: product.id_product,
            description: product.description,
            priceSell: product.priceSell,
            stock: product.stock,
            marca: product.marca,
            codigoBarra: product.codigoBarra,
            sizes: product.sizes,
            colors: product.colors
          },
          // ✅ USAR LA CANTIDAD DISPONIBLE CALCULADA
          quantity: Math.max(0, availableQuantity), // No permitir cantidades negativas
          unit_price: product.priceSell,
          // ✅ AGREGAR INFORMACIÓN ADICIONAL
          originalQuantity: product.ProductOrderDetail?.quantity || 1,
          availableForReturn: Math.max(0, availableQuantity)
        };
      }).filter(item => item.availableForReturn > 0) || [] // ✅ FILTRAR PRODUCTOS SIN CANTIDAD DISPONIBLE
    };

    console.log("📦 Productos en el recibo:", transformedReceipt.products.length);
    console.log("🔍 Devoluciones previas encontradas:", existingReturns.length);

    // ✅ AGREGAR INFORMACIÓN SOBRE DEVOLUCIONES PREVIAS
    if (existingReturns.length > 0) {
      transformedReceipt.returnHistory = existingReturns.map(ret => ({
        id_return: ret.id_return,
        return_date: ret.return_date,
        total_returned: ret.total_returned,
        status: ret.status
      }));
    }

    return response(res, 200, "success", {
      success: true,
      receipt: transformedReceipt,
      message: existingReturns.length > 0 
        ? `Recibo encontrado con ${existingReturns.length} devolución(es) previa(s)` 
        : "Recibo encontrado exitosamente"
    });

  } catch (error) {
    console.error("💥 ERROR en getReceiptForReturn:", error);
    
    return response(res, 500, "error", {
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
};