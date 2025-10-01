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
    console.log("🎁 Consultando GiftCards desde AMBAS fuentes (tabla GiftCard + Receipt)...");
    
    // ✅ MÉTODO 1: Consultar tabla GiftCard (nuevas compras)
    const giftCardsFromTable = await GiftCard.findAll({
      where: {
        saldo: { [Op.gt]: 0 }, // Solo GiftCards con saldo > 0
        estado: 'activa' // Solo GiftCards activas
      },
      attributes: ['id_giftcard', 'buyer_email', 'saldo', 'estado', 'createdAt'],
      raw: true
    });

    console.log(`✅ GiftCards desde tabla GiftCard: ${giftCardsFromTable.length}`);

    // ✅ MÉTODO 2: Consultar tabla Receipt (compras existentes) - OBTENER MONTO ORIGINAL
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

    console.log(`✅ GiftCards desde tabla Receipt: ${purchasedBalances.length}`);

    // ✅ COMBINAR AMBAS FUENTES
    const allGiftCardEmails = new Set();
    const combinedGiftCards = [];

    // Agregar desde tabla GiftCard
    giftCardsFromTable.forEach(card => {
      allGiftCardEmails.add(card.buyer_email);
      combinedGiftCards.push({
        email: card.buyer_email,
        availableBalance: parseFloat(card.saldo), // Saldo disponible
        originalAmount: parseFloat(card.saldo), // Para GiftCard nueva, original = disponible
        source: 'GiftCard_table'
      });
    });

    // Agregar desde tabla Receipt (solo si no existe en GiftCard)
    // Para estas, necesitamos obtener el saldo real vs el monto original
    for (const receipt of purchasedBalances) {
      if (!allGiftCardEmails.has(receipt.buyer_email)) {
        allGiftCardEmails.add(receipt.buyer_email);
        
        // 🔍 OBTENER SALDO REAL para esta GiftCard desde tabla GiftCard
        try {
          const giftCardBalance = await GiftCard.findOne({ 
            where: { buyer_email: receipt.buyer_email },
            attributes: ['saldo'],
            raw: true
          });
          
          // Si existe en tabla GiftCard, usar ese saldo; si no, usar el monto original
          const availableBalance = giftCardBalance ? parseFloat(giftCardBalance.saldo) : parseFloat(receipt.totalPurchased);
          
          console.log(`🔍 [getActiveGiftCards] ${receipt.buyer_email}:`, {
            montoOriginal: receipt.totalPurchased,
            saldoDisponible: availableBalance,
            diferencia: parseFloat(receipt.totalPurchased) - availableBalance,
            fuenteSaldo: giftCardBalance ? 'GiftCard_table' : 'Receipt_fallback'
          });
          
          combinedGiftCards.push({
            email: receipt.buyer_email,
            availableBalance: availableBalance, // Saldo real disponible
            originalAmount: parseFloat(receipt.totalPurchased), // Monto original de la compra
            source: giftCardBalance ? 'Receipt_with_GiftCard_balance' : 'Receipt_table'
          });
        } catch (error) {
          console.error(`❌ Error obteniendo saldo real para ${receipt.buyer_email}:`, error);
          // Si falla, usar monto original como disponible
          combinedGiftCards.push({
            email: receipt.buyer_email,
            availableBalance: parseFloat(receipt.totalPurchased),
            originalAmount: parseFloat(receipt.totalPurchased),
            source: 'Receipt_table_fallback'
          });
        }
      }
    }

    console.log(`📊 Total emails únicos con GiftCards: ${allGiftCardEmails.size}`);

    if (combinedGiftCards.length === 0) {
      console.log("No active GiftCards found from either source.");
      return res.status(200).json({ activeCards: [] });
    }

    // ✅ OBTENER USUARIOS ASOCIADOS
    const activeEmails = Array.from(allGiftCardEmails);
    console.log("Active Emails:", activeEmails);

    const activeUsers = await User.findAll({
      where: {
        email: activeEmails
      },
      attributes: ['n_document', 'first_name', 'last_name', 'email'],
      raw: true
    });
    console.log("Active Users Found:", activeUsers);

    // ✅ COMBINAR DATOS FINALES
    const activeCardsResult = activeUsers.map(user => {
      const giftCardData = combinedGiftCards.find(card => card.email === user.email);
      
      if (!giftCardData) {
        console.warn(`⚠️ Usuario ${user.email} no tiene GiftCard activa`);
        return null;
      }

      console.log(`🎁 GiftCard procesada:`, {
        email: user.email,
        availableBalance: giftCardData.availableBalance,
        originalAmount: giftCardData.originalAmount,
        source: giftCardData.source,
        usuario: `${user.first_name} ${user.last_name}`,
        documento: user.n_document
      });

      return {
        n_document: user.n_document,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        balance: giftCardData.availableBalance, // ✅ Saldo disponible (compatibilidad)
        availableBalance: giftCardData.availableBalance, // ✅ Saldo disponible
        originalAmount: giftCardData.originalAmount // ✅ Monto original
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