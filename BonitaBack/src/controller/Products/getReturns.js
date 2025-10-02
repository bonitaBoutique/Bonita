const { Return, Receipt, User, conn: sequelize } = require("../../data");
const { Op } = require("sequelize");
const response = require("../../utils/response");

// ✅ OBTENER TODAS LAS DEVOLUCIONES CON PAGINACIÓN
const getReturns = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = null, date_from = null, date_to = null } = req.query;
    const offset = (page - 1) * limit;

    // ✅ CONFIGURAR FILTROS
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (date_from && date_to) {
      where.return_date = {
        [Op.between]: [date_from, date_to]
      };
    } else if (date_from) {
      where.return_date = {
        [Op.gte]: date_from
      };
    } else if (date_to) {
      where.return_date = {
        [Op.lte]: date_to
      };
    }

    const { count, rows } = await Return.findAndCountAll({
      where,
      include: [
        {
          model: Receipt,
          as: 'originalReceipt',
          attributes: ['id_receipt', 'buyer_name', 'buyer_email', 'total_amount', 'date']
        },
        {
          model: Receipt,
          as: 'newReceipt',
          attributes: ['id_receipt', 'total_amount', 'payMethod'],
          required: false
        },
        {
          model: User,
          as: 'cashier',
          attributes: ['n_document', 'first_name', 'last_name'],
          required: false
        }
      ],
      order: [['return_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // ✅ PROCESAR DATOS PARA INCLUIR PRODUCTOS PARSEADOS
    const processedReturns = rows.map(returnItem => {
      const returnData = returnItem.toJSON();
      
      try {
        returnData.returned_products = JSON.parse(returnData.returned_products || '[]');
        returnData.new_products = JSON.parse(returnData.new_products || '[]');
      } catch (error) {
        console.error('Error parsing products JSON:', error);
        returnData.returned_products = [];
        returnData.new_products = [];
      }
      
      return returnData;
    });

    return response(res, 200, "success", {
      success: true,
      data: {
        returns: processedReturns,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error("Error obteniendo devoluciones:", error);
    return response(res, 500, "error", {
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
};

// ✅ OBTENER UNA DEVOLUCIÓN ESPECÍFICA POR ID
const getReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    const returnItem = await Return.findByPk(id, {
      include: [
        {
          model: Receipt,
          as: 'originalReceipt',
          attributes: ['id_receipt', 'buyer_name', 'buyer_email', 'buyer_phone', 'total_amount', 'date', 'payMethod']
        },
        {
          model: Receipt,
          as: 'newReceipt',
          attributes: ['id_receipt', 'total_amount', 'payMethod', 'date'],
          required: false
        },
        {
          model: User,
          as: 'cashier',
          attributes: ['n_document', 'first_name', 'last_name', 'email'],
          required: false
        }
      ]
    });

    if (!returnItem) {
      return response(res, 404, "error", {
        success: false,
        error: "Devolución no encontrada"
      });
    }

    // ✅ PROCESAR DATOS
    const returnData = returnItem.toJSON();
    
    try {
      returnData.returned_products = JSON.parse(returnData.returned_products || '[]');
      returnData.new_products = JSON.parse(returnData.new_products || '[]');
    } catch (error) {
      console.error('Error parsing products JSON:', error);
      returnData.returned_products = [];
      returnData.new_products = [];
    }

    return response(res, 200, "success", {
      success: true,
      data: returnData
    });

  } catch (error) {
    console.error("Error obteniendo devolución:", error);
    return response(res, 500, "error", {
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
};

// ✅ OBTENER ESTADÍSTICAS DE DEVOLUCIONES
const getReturnStats = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    const where = {};
    if (date_from && date_to) {
      where.return_date = {
        [Op.between]: [date_from, date_to]
      };
    }

    const stats = await Return.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id_return')), 'total_returns'],
        [sequelize.fn('SUM', sequelize.col('total_returned')), 'total_amount_returned'],
        [sequelize.fn('SUM', sequelize.col('total_new_purchase')), 'total_new_purchases'],
        [sequelize.fn('SUM', sequelize.col('difference_amount')), 'total_difference'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN difference_amount > 0 THEN 1 END")), 'returns_with_payment'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN difference_amount < 0 THEN 1 END")), 'returns_with_credit'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN difference_amount = 0 THEN 1 END")), 'exact_exchanges']
      ],
      raw: true
    });

    return response(res, 200, "success", {
      success: true,
      data: stats[0] || {}
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return response(res, 500, "error", {
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
};

module.exports = {
  getReturns,
  getReturnById,
  getReturnStats
};