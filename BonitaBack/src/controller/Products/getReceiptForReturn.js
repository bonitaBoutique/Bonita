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
          through: { attributes: ['quantity'] },
          as: 'products',
          attributes: ['id_product', 'description', 'priceSell', 'stock', 'marca', 'codigoBarra']
        }]
      }]
    });

    if (!receipt) {
      return response(res, 404, { error: "Recibo no encontrado" });
    }

    // Verificar que el recibo no sea muy antiguo (opcional - 30 días)
    const daysSinceReceipt = Math.floor((new Date() - new Date(receipt.date)) / (1000 * 60 * 60 * 24));
    if (daysSinceReceipt > 30) {
      console.log("⚠️ Recibo antiguo detectado:", daysSinceReceipt, "días");
    }

    console.log("✅ Recibo encontrado:", {
      receiptId: receipt.id_receipt,
      buyerName: receipt.buyer_name,
      totalAmount: receipt.total_amount,
      daysSince: daysSinceReceipt
    });

    return response(res, 200, {
      receipt,
      daysSinceReceipt,
      canReturn: daysSinceReceipt <= 30, // Política de devolución
      message: "Recibo encontrado exitosamente"
    });

  } catch (error) {
    console.error("❌ Error buscando recibo:", error);
    return response(res, 500, { 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
};