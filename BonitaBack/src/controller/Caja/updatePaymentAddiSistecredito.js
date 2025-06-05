const { Receipt } = require("../../data");

const updatePaymentAddiSistecredito = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { depositDate, depositAmount, notes } = req.body;

    console.log(`📝 Actualizando depósito para recibo ${receiptId}`);

    const receipt = await Receipt.findByPk(receiptId);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Recibo no encontrado"
      });
    }

    // ✅ CORREGIR: Usar el campo correcto del modelo Receipt
    if (!['Addi', 'Sistecredito'].includes(receipt.payMethod)) { // ← Campo correcto
      return res.status(400).json({
        success: false,
        message: "Este recibo no es de Addi o Sistecredito"
      });
    }

    const updatedReceipt = await receipt.update({
      depositDate: depositDate || null,
      depositAmount: depositAmount || receipt.total_amount, // ← Campo correcto
      depositNotes: notes || null,
      updatedAt: new Date()
    });

    console.log(`✅ Depósito actualizado para recibo ${receiptId}`);

    return res.status(200).json({
      success: true,
      message: depositDate ? "Depósito registrado exitosamente" : "Depósito removido exitosamente",
      data: {
        receipt: updatedReceipt
      }
    });

  } catch (error) {
    console.error("❌ Error al actualizar depósito:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el depósito",
      error: error.message
    });
  }
};

module.exports = updatePaymentAddiSistecredito;