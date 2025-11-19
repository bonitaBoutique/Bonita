const { AddiSistecreditoDeposit } = require("../data");

const createAddiSistecreditoDeposit = async (req, res) => {
  try {
    const {
      platform,
      depositDate,
      amount,
      referenceNumber,
      description,
      registeredBy,
      notes
    } = req.body;

    // Validaciones
    if (!platform || !depositDate || !amount) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios: platform, depositDate, amount"
      });
    }

    if (!['Addi', 'Sistecredito'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: "Platform debe ser 'Addi' o 'Sistecredito'"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "El monto debe ser mayor a 0"
      });
    }

    const deposit = await AddiSistecreditoDeposit.create({
      platform,
      depositDate,
      amount: parseFloat(amount),
      referenceNumber: referenceNumber || null,
      description: description || null,
      registeredBy: registeredBy || 'sistema',
      status: "Registrado",
      notes: notes || null
    });

    console.log(`✅ Depósito ${platform} registrado: $${amount}`);

    return res.status(201).json({
      success: true,
      message: "Depósito registrado exitosamente",
      data: { deposit }
    });

  } catch (error) {
    console.error("❌ Error al crear depósito:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al crear el depósito",
      error: error.message
    });
  }
};

module.exports = createAddiSistecreditoDeposit;