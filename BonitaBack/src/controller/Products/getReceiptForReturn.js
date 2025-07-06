const { Receipt, OrderDetail, Product } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { receipt_id } = req.params;

    console.log("🔍 Buscando recibo para devolución:", receipt_id);

    const receipt = await Receipt.findByPk(receipt_id, {
      include: [{
        model: OrderDetail,
        include: [{
          model: Product,
          through: { 
            attributes: ['quantity', 'unit_price'] // ✅ INCLUIR PRECIO UNITARIO
          },
          as: 'products',
          attributes: ['id_product', 'description', 'priceSell', 'stock', 'marca', 'codigoBarra']
        }]
      }]
    });

    if (!receipt) {
      return response(res, 404, { 
        success: false, // ✅ AGREGAR FLAG
        error: "Recibo no encontrado" 
      });
    }

    // Verificar que el recibo no sea muy antiguo (opcional - 30 días)
    const daysSinceReceipt = Math.floor((new Date() - new Date(receipt.date)) / (1000 * 60 * 60 * 24));
    
    // ✅ FORMATEAR PRODUCTOS PARA MEJOR USO EN FRONTEND
    const formattedProducts = [];
    if (receipt.OrderDetails && receipt.OrderDetails[0]?.products) {
      receipt.OrderDetails[0].products.forEach(product => {
        const orderDetailProduct = product.OrderDetailProduct;
        if (orderDetailProduct) {
          formattedProducts.push({
            id_product: product.id_product,
            description: product.description,
            marca: product.marca,
            codigoBarra: product.codigoBarra,
            priceSell: product.priceSell,
            stock: product.stock,
            quantity_bought: orderDetailProduct.quantity,
            unit_price: orderDetailProduct.unit_price || product.priceSell,
            total_paid: (orderDetailProduct.unit_price || product.priceSell) * orderDetailProduct.quantity
          });
        }
      });
    }

    console.log("✅ Recibo encontrado:", {
      receiptId: receipt.id_receipt,
      buyerName: receipt.buyer_name,
      totalAmount: receipt.total_amount,
      productsCount: formattedProducts.length,
      daysSince: daysSinceReceipt
    });

    return response(res, 200, {
      success: true, // ✅ AGREGAR FLAG
      data: {
        receipt: {
          ...receipt.toJSON(),
          formattedProducts // ✅ PRODUCTOS FORMATEADOS
        },
        daysSinceReceipt,
        canReturn: daysSinceReceipt <= 30,
        returnPolicy: {
          maxDays: 30,
          message: daysSinceReceipt > 30 ? 
            `El recibo tiene ${daysSinceReceipt} días. Solo se permiten devoluciones dentro de 30 días.` :
            `Recibo válido para devolución (${daysSinceReceipt} días desde la compra).`
        }
      },
      message: "Recibo encontrado exitosamente"
    });

  } catch (error) {
    console.error("❌ Error buscando recibo:", error);
    return response(res, 500, { 
      success: false, // ✅ AGREGAR FLAG
      error: "Error interno del servidor",
      details: error.message 
    });
  }
};