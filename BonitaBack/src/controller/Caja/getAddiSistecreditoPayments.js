const { Receipt, OrderDetail, Product } = require("../../data");
const { Op } = require("sequelize");

module.exports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all', // 'pending', 'deposited', 'all'
      paymentMethod = 'all', // 'Addi', 'Sistecredito', 'all'
      startDate,
      endDate 
    } = req.query;

    const offset = (page - 1) * limit;

    // ✅ Construir filtros
    const whereConditions = {
      paymentMethod: {
        [Op.in]: ['Addi', 'Sistecredito']
      }
    };

    // ✅ Filtrar por método específico
    if (paymentMethod !== 'all') {
      whereConditions.paymentMethod = paymentMethod;
    }

    // ✅ Filtrar por estado de depósito
    if (status === 'pending') {
      whereConditions.depositDate = null;
    } else if (status === 'deposited') {
      whereConditions.depositDate = {
        [Op.not]: null
      };
    }

    // ✅ Filtrar por rango de fechas de creación
    if (startDate && endDate) {
      whereConditions.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // ✅ Obtener recibos con información completa
    const receipts = await Receipt.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: OrderDetail,
          as: 'orderDetails',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'category']
            }
          ]
        }
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // ✅ Calcular totales
    const totals = {
      pending: 0,
      deposited: 0,
      total: 0
    };

    receipts.rows.forEach(receipt => {
      const amount = parseFloat(receipt.totalAmount) || 0;
      totals.total += amount;
      
      if (receipt.depositDate) {
        totals.deposited += amount;
      } else {
        totals.pending += amount;
      }
    });

    console.log(`📊 Pagos Addi/Sistecredito encontrados: ${receipts.count}`);
    console.log(`💰 Totales:`, totals);

    return res.status(200).json({
      success: true,
      data: {
        receipts: receipts.rows,
        pagination: {
          total: receipts.count,
          pages: Math.ceil(receipts.count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        },
        totals,
        filters: {
          status,
          paymentMethod,
          startDate,
          endDate
        }
      }
    });

  } catch (error) {
    console.error("❌ Error al obtener pagos Addi/Sistecredito:", error.message);
    return res.status(500).json({ 
      success: false,
      message: "Error al obtener los pagos",
      error: error.message 
    });
  }
};