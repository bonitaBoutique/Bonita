const { Receipt, OrderDetail, Product } = require("../../data");
const { Op } = require("sequelize");

const getAddiSistecreditoPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all',
      paymentMethod = 'all',
      startDate,
      endDate 
    } = req.query;

    const offset = (page - 1) * limit;

    // ✅ CORREGIR: Usar el campo correcto del modelo Receipt
    const whereConditions = {
      payMethod: { // ← Campo correcto en Receipt
        [Op.in]: ['Addi', 'Sistecredito']
      }
    };

    if (paymentMethod !== 'all') {
      whereConditions.payMethod = paymentMethod; // ← Campo correcto
    }

    if (status === 'pending') {
      whereConditions.depositDate = null;
    } else if (status === 'deposited') {
      whereConditions.depositDate = {
        [Op.not]: null
      };
    }

    if (startDate && endDate) {
      whereConditions.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    console.log("🔍 Filtros aplicados:", whereConditions);

    const receipts = await Receipt.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: OrderDetail,
          as: 'orderDetail', // ← Usar alias singular correcto
          required: false,
          include: [
            {
              model: Product,
              as: 'products', // ← Usar alias plural para productos
              through: { attributes: [] }, // Para relación many-to-many
              required: false,
              attributes: ['id', 'name', 'category']
            }
          ]
        }
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totals = {
      pending: 0,
      deposited: 0,
      total: 0
    };

    receipts.rows.forEach(receipt => {
      const amount = parseFloat(receipt.total_amount) || 0; // ← Campo correcto
      totals.total += amount;
      
      if (receipt.depositDate) {
        totals.deposited += amount;
      } else {
        totals.pending += amount;
      }
    });

    console.log(`📊 Pagos encontrados: ${receipts.count}`);

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
    console.error("❌ Error al obtener pagos:", error.message);
    return res.status(500).json({ 
      success: false,
      message: "Error al obtener los pagos",
      error: error.message 
    });
  }
};

module.exports = getAddiSistecreditoPayments;