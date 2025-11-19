const { Receipt } = require("../data");

const markReceiptAsConciliated = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { isConciliated = true } = req.body;

    console.log(`🔄 Marcando recibo ${receiptId} como conciliado: ${isConciliated}`);

    const receipt = await Receipt.findByPk(receiptId);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Recibo no encontrado"
      });
    }

    // Verificar que sea Addi o Sistecredito
    if (!['Addi', 'Sistecredito'].includes(receipt.payMethod)) {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden conciliar recibos de Addi o Sistecredito"
      });
    }

    await receipt.update({ isConciliated });

    console.log(`✅ Recibo ${receiptId} marcado como conciliado: ${isConciliated}`);

    return res.status(200).json({
      success: true,
      message: `Recibo ${isConciliated ? 'marcado' : 'desmarcado'} como conciliado`,
      data: {
        id_receipt: receipt.id_receipt,
        isConciliated: receipt.isConciliated,
        payMethod: receipt.payMethod,
        total_amount: receipt.total_amount
      }
    });

  } catch (error) {
    console.error("❌ Error al marcar recibo como conciliado:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el recibo",
      error: error.message
    });
  }
};

module.exports = markReceiptAsConciliated;
