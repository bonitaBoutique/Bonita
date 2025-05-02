// Importa 'conn' en lugar de 'sequelize'
const { Receipt, User, conn } = require("../../data"); // <--- Cambiado aquí

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
    // 1. Obtener la suma total de GiftCards compradas por cada email
    const purchasedBalances = await Receipt.findAll({
      attributes: [
        'buyer_email',
        // Usa la instancia correcta (sequelize o conn)
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalPurchased']
      ],
      where: {
        payMethod: "GiftCard"
      },
      group: ['buyer_email'],
      // Usa la instancia correcta (sequelize o conn)
      having: sequelize.literal('SUM(total_amount) > 0'),
      raw: true
    });

    console.log("Purchased Balances per Email (SUM > 0):", purchasedBalances);

    // --- Sección Futura: Restar Canjes ---
    // const redemptions = await GiftCardRedemption.findAll({ attributes: ['user_email', [sequelize.fn('SUM', sequelize.col('amount_redeemed')), 'totalRedeemed']], group: ['user_email'], raw: true });
    // const redemptionMap = redemptions.reduce((acc, item) => { acc[item.user_email] = parseFloat(item.totalRedeemed); return acc; }, {});
    // --- Fin Sección Futura ---

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
      const currentBalance = balanceInfo ? parseFloat(balanceInfo.totalPurchased) : 0;

      // --- Aplicar resta de canjes (futuro) ---
      // const redeemedAmount = redemptionMap[user.email] || 0; // Asegúrate que redemptionMap esté definido
      // const finalBalance = currentBalance - redeemedAmount;
      // --- Fin resta de canjes ---

      const finalBalance = currentBalance; // Por ahora solo compras

      if (finalBalance > 0) {
        return {
          n_document: user.n_document,
          first_name: user.first_name,
          last_name: user.last_name,
          balance: finalBalance
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