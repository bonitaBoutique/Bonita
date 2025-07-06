const { Receipt, OrderDetail, sequelize } = require("../../data");

module.exports = async (req, res) => {
  try {
    // ✅ Buscar el último recibo existente (sin incrementar)
    const lastReceipt = await Receipt.findOne({
      order: [['id_receipt', 'DESC']],
      where: {
        deletedAt: null // ✅ Asegurar que no esté eliminado
      }
    });

    console.log("🧾 Último recibo encontrado:", lastReceipt?.id_receipt);

    // Si no existe ningún recibo, devolver null o un valor base
    if (!lastReceipt) {
      return res.status(200).json({ 
        receipt_number: null,
        message: "No se encontraron recibos" 
      });
    }

    // ✅ CAMBIO PRINCIPAL: Devolver el número real del último recibo (SIN incrementar)
    return res.status(200).json({ 
      receipt_number: lastReceipt.id_receipt,
      created_at: lastReceipt.createdAt 
    });

  } catch (error) {
    console.error("💥 Error al obtener el último recibo:", error.message);
    return res.status(500).json({ 
      status: "error",
      message: "Error al obtener el último recibo",
      error: error.message 
    });
  }
};