const { Return, Receipt, User, conn: sequelize } = require("../../data"); // ✅ CORREGIR: usar conn
const { Op } = require("sequelize");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all',
      cashier_document,
      startDate,
      endDate 
    } = req.query;

    console.log("📋 Obteniendo historial de devoluciones:", { 
      page, limit, status, cashier_document, startDate, endDate 
    });

    const offset = (page - 1) * limit;

    // ✅ Condiciones de búsqueda
    const whereConditions = {};

    // Filtro por estado
    if (status !== 'all') {
      whereConditions.status = status;
    }

    // Filtro por cajero
    if (cashier_document) {
      whereConditions.cashier_document = cashier_document;
    }

    // Filtro por fechas
    if (startDate || endDate) {
      whereConditions.return_date = {};
      if (startDate) {
        whereConditions.return_date[Op.gte] = startDate;
      }
      if (endDate) {
        whereConditions.return_date[Op.lte] = endDate;
      }
    }

    const returns = await Return.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["return_date", "DESC"], ["id_return", "DESC"]],
      include: [
        {
          model: Receipt,
          as: 'originalReceipt',
          attributes: ['id_receipt', 'buyer_name', 'buyer_email', 'total_amount', 'date']
        },
        {
          model: Receipt,
          as: 'newReceipt',
          required: false,
          attributes: ['id_receipt', 'total_amount', 'payMethod']
        },
        {
          model: User,
          as: 'cashier',
          required: false,
          // ✅ CORREGIR: Usar los campos que SÍ existen en el modelo User
          attributes: ['n_document', 'first_name', 'last_name', 'email']
        }
      ]
    });

    // ✅ CORREGIR: Calcular estadísticas con sequelize correcto
    const stats = await Return.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id_return')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_returned')), 'total_amount']
      ],
      group: ['status']
    });

    console.log("✅ Historial obtenido:", {
      total: returns.count,
      returned: returns.rows.length
    });

    return response(res, 200, {
      data: {
        returns: returns.rows,
        pagination: {
          total: returns.count,
          totalPages: Math.ceil(returns.count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        },
        stats
      },
      message: "Historial de devoluciones obtenido exitosamente"
    });

  } catch (error) {
    console.error("❌ Error obteniendo historial:", error);
    return response(res, 500, { 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
};