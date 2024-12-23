const { Receipt } = require("../../data");

module.exports = async (req, res) => {
  try {
    const lastReceipt = await Receipt.findOne({
      order: [["id", "DESC"]], // Ordenar por el ID descendente
    });

    if (!lastReceipt) {
      return res.status(404).json({ message: "No hay recibos creados aún" });
    }

    return res.status(200).json(lastReceipt);
  } catch (error) {
    console.error("Error al obtener el último recibo:", error.message);
    return res.status(500).json({ message: "Error al obtener el último recibo" });
  }
};
