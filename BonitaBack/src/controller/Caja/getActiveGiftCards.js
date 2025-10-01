// Importa 'conn' en lugar de 'sequelize'
const { GiftCard, User, conn } = require("../../data"); // ✅ Cambiar Receipt por GiftCard

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
    // ✅ NUEVA LÓGICA: Consultar directamente la tabla GiftCard
    console.log("🎁 Consultando GiftCards activas desde tabla GiftCard...");
    
    const activeGiftCards = await GiftCard.findAll({
      where: {
        saldo: { [sequelize.Op.gt]: 0 }, // Solo GiftCards con saldo > 0
        estado: 'activa' // Solo GiftCards activas
      },
      attributes: ['id_giftcard', 'buyer_email', 'saldo', 'estado', 'createdAt'],
      raw: true // Usar raw para obtener datos planos
    });

    console.log(`✅ GiftCards activas encontradas: ${activeGiftCards.length}`);

    if (!activeGiftCards || activeGiftCards.length === 0) {
      console.log("No active GiftCards found.");
      return res.status(200).json({ activeCards: [] });
    }

    // ✅ OBTENER USUARIOS ASOCIADOS
    const activeEmails = activeGiftCards.map(card => card.buyer_email);
    console.log("Active Emails:", activeEmails);

    const activeUsers = await User.findAll({
      where: {
        email: activeEmails
      },
      attributes: ['n_document', 'first_name', 'last_name', 'email'],
      raw: true
    });
    console.log("Active Users Found:", activeUsers);

    // ✅ COMBINAR DATOS
    const activeCardsResult = activeUsers.map(user => {
      const giftCard = activeGiftCards.find(card => card.buyer_email === user.email);
      
      if (!giftCard) {
        console.warn(`⚠️ Usuario ${user.email} no tiene GiftCard activa`);
        return null;
      }

      console.log(`🎁 GiftCard procesada:`, {
        email: user.email,
        saldo: giftCard.saldo,
        usuario: `${user.first_name} ${user.last_name}`,
        documento: user.n_document
      });

      return {
        n_document: user.n_document,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email, // 🔍 AGREGAR EMAIL PARA QUE FRONTEND PUEDA CONSULTAR SALDO REAL
        balance: giftCard.saldo // Usar el saldo directo de la GiftCard
      };
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