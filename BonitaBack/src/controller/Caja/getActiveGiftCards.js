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
    // ✅ NUEVA LÓGICA: Obtener directamente desde GiftCards con saldo > 0
    console.log("🎁 Consultando GiftCards activas directamente desde tabla GiftCards...");
    
    // 1. Obtener saldo consolidado por email desde GiftCards activas
    const activeGiftCards = await GiftCard.findAll({
      attributes: [
        'buyer_email',
        [sequelize.fn('SUM', sequelize.col('saldo')), 'totalBalance'],
        [sequelize.fn('MAX', sequelize.col('createdAt')), 'latestDate']
      ],
      where: {
        estado: 'activa',
        saldo: { [sequelize.Sequelize.Op.gt]: 0 }
      },
      group: ['buyer_email'],
      having: sequelize.literal('SUM(saldo) > 0'),
      raw: true
    });

    console.log("✅ GiftCards activas encontradas:", activeGiftCards.length);

    if (!activeGiftCards || activeGiftCards.length === 0) {
      console.log("No active GiftCards found.");
      return res.status(200).json({ activeCards: [] });
    }

    const activeEmails = activeGiftCards.map(item => item.buyer_email);
    console.log("Active Emails:", activeEmails);

    // 2. Obtener información de usuarios
    const activeUsers = await User.findAll({
      where: {
        email: activeEmails
      },
      attributes: ['n_document', 'first_name', 'last_name', 'email'],
      raw: true
    });
    console.log("Active Users Found:", activeUsers.length);

    // 3. Combinar información
    const activeCardsResult = activeUsers.map(user => {
      const giftCardInfo = activeGiftCards.find(gc => gc.buyer_email === user.email);
      
      if (giftCardInfo && parseFloat(giftCardInfo.totalBalance) > 0) {
        return {
          n_document: user.n_document,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          balance: parseFloat(giftCardInfo.totalBalance), // Saldo real disponible
          created_at: giftCardInfo.latestDate // Fecha de la GiftCard más reciente
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