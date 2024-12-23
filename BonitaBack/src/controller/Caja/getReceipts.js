const { Receipt } = require("../../data");

module.exports = async (req, res) => {
  try {
    // Traer todos los recibos con la opción de paginación
    const { page = 1, limit = 10 } = req.query; // Parámetros opcionales para paginación
    const offset = (page - 1) * limit;

    const receipts = await Receipt.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]], // Ordenar por ID descendente (más recientes primero)
    });

    if (receipts.count === 0) {
      return res.status(404).json({ message: "No hay recibos registrados" });
    }

    return res.status(200).json({
      total: receipts.count,
      pages: Math.ceil(receipts.count / limit),
      currentPage: parseInt(page),
      receipts: receipts.rows,
    });
  } catch (error) {
    console.error("Error al obtener los recibos:", error.message);
    return res.status(500).json({ message: "Error al obtener los recibos" });
  }
};
