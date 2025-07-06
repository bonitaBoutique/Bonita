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
      products: receipt.OrderDetail?.products?.map(product => ({
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
        // ✅ USAR priceSell como unit_price si no existe en la tabla intermedia
        quantity: product.OrderProduct?.quantity || 1,
        unit_price: product.priceSell // Usar el precio de venta del producto
      })) || []
    };

    console.log("📦 Productos en el recibo:", transformedReceipt.products.length);

    return response(res, 200, "success", {
      success: true,
      receipt: transformedReceipt,
      message: "Recibo encontrado exitosamente"
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