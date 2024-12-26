const { Receipt, OrderDetail, sequelize } = require("../../data");

module.exports = async (req, res) => {
  try {
    // Buscar el último recibo basado en id_receipt (ya que ese es el campo correcto)
    const lastReceipt = await Receipt.findOne({
      order: [['id_receipt', 'DESC']],  // Orden descendente para obtener el último recibo por id_receipt
    });

    console.log("Último recibo encontrado:", lastReceipt);  // Agrega un log para verificar qué recibo se obtiene

    // Si no existe ningún recibo, asignamos el número de recibo a 1001
    if (!lastReceipt) {
      return res.status(200).json({ receipt_number: 1001 });
    }

    // Si existe un último recibo, incrementa el id_receipt en 1
    return res.status(200).json({ receipt_number: lastReceipt.id_receipt + 1 });
  } catch (error) {
    console.error("Error al obtener el último recibo:", error.message);
    return res.status(500).json({ message: "Error al obtener el último recibo" });
  }
};




