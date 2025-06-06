const { AddiSistecreditoDeposit, User } = require("../data");
const { Op } = require("sequelize");

const getAddiSistecreditoDeposits = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      platform = 'all',
      status = 'all',
      startDate,
      endDate 
    } = req.query;

    const offset = (page - 1) * limit;

    const whereConditions = {};

    if (platform !== 'all') {
      whereConditions.platform = platform;
    }

    if (status !== 'all') {
      whereConditions.status = status;
    }

    if (startDate && endDate) {
      whereConditions.depositDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const deposits = await AddiSistecreditoDeposit.findAndCountAll({
      where: whereConditions,
      include: [{
        model: User,
        as: 'registeredByUser',
        attributes: ['first_name', 'last_name']
      }],
      order: [['depositDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      data: {
        deposits: deposits.rows,
        pagination: {
          total: deposits.count,
          pages: Math.ceil(deposits.count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        },
        filters: { platform, status, startDate, endDate }
      }
    });

  } catch (error) {
    console.error("❌ Error al obtener depósitos:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los depósitos",
      error: error.message
    });
  }
};

module.exports = getAddiSistecreditoDeposits;