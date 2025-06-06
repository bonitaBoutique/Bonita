const { AddiSistecreditoDeposit } = require("../data");

const updateAddiSistecreditoDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { status, notes, description, referenceNumber } = req.body;

    const deposit = await AddiSistecreditoDeposit.findByPk(depositId);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Depósito no encontrado"
      });
    }

    // Validar estado si se proporciona
    if (status && !['Registrado', 'Conciliado', 'Revisión'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Estado inválido. Debe ser: Registrado, Conciliado o Revisión"
      });
    }

    const updatedDeposit = await deposit.update({
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(description !== undefined && { description }),
      ...(referenceNumber !== undefined && { referenceNumber }),
      updatedAt: new Date()
    });

    console.log(`✅ Depósito ${depositId} actualizado - Estado: ${status || deposit.status}`);

    return res.status(200).json({
      success: true,
      message: "Depósito actualizado exitosamente",
      data: { deposit: updatedDeposit }
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

module.exports = updateAddiSistecreditoDeposit;