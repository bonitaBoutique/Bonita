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
        // ✅ AGREGAR LOS CAMPOS DE PRECIO QUE FALTAN
        attributes: [
          "id_product", 
          "codigoBarra", 
          "description", 
          "marca", 
          "stock",
          "stockInicial",  // ✅ Agregado
          "price",         // ✅ Agregado - Precio de compra
          "priceSell"      // ✅ Agregado - Precio de venta
        ],
        required: true
      },
      // ✅ TAMBIÉN AGREGAR unit_price del movimiento si existe
      attributes: [
        "id_movement",
        "id_product",
        "type",
        "quantity",
        "date",
        "reason",
        "reference_type",
        "reference_id",
        "unit_price",        // ✅ Precio específico del movimiento
        "notes",
        "createdAt",
        "updatedAt"
      ],
      order: [["date", "DESC"], ["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (page - 1) * parseInt(limit)
    });

    // ✅ DEBUG: Log para verificar los precios
    console.log("✅ Movimientos obtenidos:", {
      total: movements.count,
      returned: movements.rows.length,
      // Debug del primer producto con precios
      firstProductPrices: movements.rows.length > 0 ? {
        id_product: movements.rows[0].Product?.id_product,
        price: movements.rows[0].Product?.price,
        priceSell: movements.rows[0].Product?.priceSell,
        stockInicial: movements.rows[0].Product?.stockInicial,
        unit_price: movements.rows[0].unit_price
      } : null
    });

    // ✅ ESTADÍSTICAS MEJORADAS
    const stats = {
      totalIn: movements.rows.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
      totalOut: movements.rows.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0),
      movementsCount: movements.count,
      lastMovementDate: movements.rows.length > 0 ? movements.rows[0].date : null
    };

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
        id_product
      },
      stats // ✅ Agregar estadísticas
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