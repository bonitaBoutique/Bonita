// Importa 'conn' en lugar de 'sequelize'
const { GiftCard, Receipt, User, conn } = require("../../data"); // ✅ Incluir ambas tablas temporalmente
const { Op } = require("sequelize"); // ✅ Importar operadores de Sequelize

// Renombra 'conn' a 'sequelize' para usarlo internamente, o usa 'conn' directamente
const sequelize = conn; // Puedes hacer esto para minimizar cambios abajo

module.exports = async (req, res) => {
  console.log("Fetching active GiftCards...");

  // Verifica la instancia renombrada o usa 'conn' directamente
  if (!sequelize || !sequelize.fn || !sequelize.col || !sequelize.literal) {
     console.error("Sequelize instance (conn) or its methods are not available!");
     return res.status(500).json({ message: "Error interno del servidor: Configuración de base de datos inválida." });
  }

  try {
    // ✅ USAR LÓGICA RAMA 32: Obtener monto original desde Receipt con SUM(total_amount)
    console.log("🎁 Consultando monto original de GiftCards desde Receipt...");
    
    // 1. Obtener la suma total de GiftCards compradas por cada email (MONTO ORIGINAL)
    const purchasedBalances = await Receipt.findAll({
      attributes: [
        'buyer_email',
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalPurchased']
      ],
      where: {
        payMethod: "GiftCard"
      },
      group: ['buyer_email'],
      having: sequelize.literal('SUM(total_amount) > 0'),
      raw: true
    });

    console.log("✅ Monto original por email (SUM > 0):", purchasedBalances);

    if (!purchasedBalances || purchasedBalances.length === 0) {
      console.log("No active GiftCards found based on purchase sum.");
      return res.status(200).json({ activeCards: [] });
    }

    const activeEmails = purchasedBalances.map(item => item.buyer_email);
    console.log("Active Emails:", activeEmails);

    const activeUsers = await User.findAll({
      where: {
        email: activeEmails
      },
      attributes: ['n_document', 'first_name', 'last_name', 'email'],
      raw: true
    });
    console.log("Active Users Found:", activeUsers);

    const activeCardsResult = activeUsers.map(user => {
      const balanceInfo = purchasedBalances.find(balance => balance.buyer_email === user.email);
      const originalBalance = balanceInfo ? parseFloat(balanceInfo.totalPurchased) : 0;

      if (originalBalance > 0) {
        return {
          n_document: user.n_document,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email, // 🎯 IMPORTANTE: Incluir email para consulta saldo disponible
          balance: originalBalance // 🎯 ESTE ES EL MONTO ORIGINAL (200k)
        };
      }
      return null;
    }).filter(card => card !== null);

    console.log("Final Active Cards Result:", activeCardsResult);
    return res.status(200).json({ activeCards: activeCardsResult });

  } catch (error) {
    console.error("Error fetching active GiftCards:", error);
    // Puedes mantener el check específico si quieres
    if (error instanceof TypeError && error.message.includes("reading 'fn'")) {
       return res.status(500).json({ message: "Error interno: La instancia de Sequelize (conn) no está definida correctamente." });
    }
    return res.status(500).json({ message: "Error al obtener GiftCards activas" });
  }
};