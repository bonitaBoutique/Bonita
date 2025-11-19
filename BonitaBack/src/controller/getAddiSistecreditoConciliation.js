const { AddiSistecreditoDeposit, Receipt, User } = require("../data");
const { Op } = require("sequelize");

const getAddiSistecreditoConciliation = async (req, res) => {
  try {
    const { 
      startDate,
      endDate,
      platform = 'all' // 'Addi', 'Sistecredito', 'all'
    } = req.query;

    const platformFilter = platform === 'all' 
      ? { [Op.in]: ['Addi', 'Sistecredito'] }
      : platform;

    // ✅ Obtener depósitos registrados
    const deposits = await AddiSistecreditoDeposit.findAll({
      where: {
        platform: platformFilter,
        ...(startDate && endDate && { 
          depositDate: { [Op.between]: [startDate, endDate] }
        })
      },
      include: [{
        model: User,
        as: 'registeredByUser',
        attributes: ['first_name', 'last_name']
      }],
      order: [['depositDate', 'DESC']]
    });

    // ✅ Obtener recibos generados
    const receipts = await Receipt.findAll({
      where: {
        payMethod: platformFilter,
        ...(startDate && endDate && { 
          date: { [Op.between]: [startDate, endDate] }
        })
      },
      attributes: [
        'id_receipt',
        'buyer_name', 
        'total_amount',
        'payMethod',
        'date',
        'isConciliated' // ✅ Agregar campo de conciliación
      ],
      order: [['date', 'DESC']]
    });

    // ✅ Calcular resumen
    const summary = {
      deposits: {
        count: deposits.length,
        totalAmount: deposits.reduce((sum, d) => sum + d.amount, 0),
        byPlatform: {
          Addi: deposits.filter(d => d.platform === 'Addi').reduce((sum, d) => sum + d.amount, 0),
          Sistecredito: deposits.filter(d => d.platform === 'Sistecredito').reduce((sum, d) => sum + d.amount, 0)
        }
      },
      receipts: {
        count: receipts.length,
        totalAmount: receipts.reduce((sum, r) => sum + r.total_amount, 0),
        byPlatform: {
          Addi: receipts.filter(r => r.payMethod === 'Addi').reduce((sum, r) => sum + r.total_amount, 0),
          Sistecredito: receipts.filter(r => r.payMethod === 'Sistecredito').reduce((sum, r) => sum + r.total_amount, 0)
        }
      }
    };

    // ✅ Calcular diferencias
    summary.difference = {
      total: summary.deposits.totalAmount - summary.receipts.totalAmount,
      Addi: summary.deposits.byPlatform.Addi - summary.receipts.byPlatform.Addi,
      Sistecredito: summary.deposits.byPlatform.Sistecredito - summary.receipts.byPlatform.Sistecredito
    };

    return res.status(200).json({
      success: true,
      data: {
        summary,
        deposits,
        receipts,
        filters: { startDate, endDate, platform }
      }
    });

  } catch (error) {
    console.error("❌ Error en conciliación:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la conciliación",
      error: error.message
    });
  }
};

module.exports = getAddiSistecreditoConciliation;