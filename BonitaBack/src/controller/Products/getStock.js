const { Product, StockMovement } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, dateFrom, dateTo } = req.query;

    // ✅ OBTENER TODOS LOS MOVIMIENTOS DE STOCK CON FILTROS
    let whereClause = {};
    
    if (type && ['IN', 'OUT'].includes(type)) {
      whereClause.type = type;
    }
    
    if (dateFrom || dateTo) {
      whereClause.date = {};
      if (dateFrom) whereClause.date[Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.date[Op.lte] = new Date(dateTo);
    }

    const movements = await StockMovement.findAndCountAll({
      where: whereClause,
      include: {
        model: Product,
        attributes: ["id_product", "codigoBarra", "description", "marca"],
        required: true
      },
      order: [["date", "DESC"]],
      limit: parseInt(limit),
      offset: (page - 1) * parseInt(limit)
    });

    return response(res, 200, {
      success: true,
      data: movements.rows,
      pagination: {
        total: movements.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(movements.count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return response(res, 500, { error: error.message });
  }
};