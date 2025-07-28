const { Product, StockMovement } = require("../../data");
const { Op } = require("sequelize");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, dateFrom, dateTo, id_product } = req.query;

    console.log("📦 Obteniendo movimientos de stock:", { page, limit, type, dateFrom, dateTo, id_product });

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

    // ✅ FILTRO POR PRODUCTO
    if (id_product) {
      whereClause.id_product = id_product;
    }

    const movements = await StockMovement.findAndCountAll({
      where: whereClause,
      include: {
        model: Product,
        attributes: ["id_product", "codigoBarra", "description", "marca", "stock"],
        required: true
      },
      order: [["date", "DESC"], ["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (page - 1) * parseInt(limit)
    });

    console.log("✅ Movimientos obtenidos:", {
      total: movements.count,
      returned: movements.rows.length
    });

    return response(res, 200, {
      success: true,
      data: movements.rows,
      pagination: {
        total: movements.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(movements.count / parseInt(limit))
      },
      filters: {
        type,
        dateFrom,
        dateTo,
        id_product // ✅ Devuelve el filtro aplicado
      }
    });
  } catch (error) {
    console.error("❌ Error fetching stock movements:", error);
    return response(res, 500, { 
      success: false,
      error: error.message,
      details: "Error al obtener movimientos de stock"
    });
  }
};