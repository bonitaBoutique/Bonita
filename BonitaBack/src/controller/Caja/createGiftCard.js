const { GiftCard, User } = require("../../data");

// Crear GiftCard
exports.createGiftCard = async (req, res) => {
  const { buyer_email, saldo, id_receipt } = req.body;
  try {
    console.log("Intentando crear GiftCard con:", { buyer_email, saldo, id_receipt }); // <-- LOG IMPORTANTE
    const giftcard = await GiftCard.create({ buyer_email, saldo, id_receipt });
    console.log("GiftCard creada:", giftcard); // <-- LOG DE ÉXITO
    res.status(201).json({ giftcard });
  } catch (error) {
    console.error("Error al crear GiftCard:", error); // <-- LOG DE ERROR
    res.status(500).json({ message: "Error al crear GiftCard" });
  }
};

// Consultar saldo consolidado de todas las GiftCards activas
exports.getGiftCardBalance = async (req, res) => {
  const { buyer_email } = req.params;
  try {
    // Buscar TODAS las GiftCards activas del email
    const giftcards = await GiftCard.findAll({ 
      where: { 
        buyer_email,
        estado: 'activa' // Solo las activas
      } 
    });
    
    if (!giftcards || giftcards.length === 0) {
      return res.status(404).json({ 
        message: "No hay GiftCards activas",
        saldo: 0,
        giftcards: []
      });
    }
    
    // Sumar el saldo de todas las GiftCards activas
    const saldoTotal = giftcards.reduce((total, gc) => total + (gc.saldo || 0), 0);
    
    console.log(`💰 Saldo consolidado para ${buyer_email}:`, {
      cantidad: giftcards.length,
      saldoTotal,
      giftcards: giftcards.map(gc => ({ id: gc.id_giftcard, saldo: gc.saldo }))
    });
    
    res.json({ 
      saldo: saldoTotal,
      cantidad: giftcards.length,
      giftcards: giftcards.map(gc => ({
        id_giftcard: gc.id_giftcard,
        saldo: gc.saldo,
        createdAt: gc.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Error al consultar saldo:', error);
    res.status(500).json({ message: "Error al consultar saldo" });
  }
};

// Canjear saldo desde múltiples GiftCards si es necesario
exports.redeemGiftCard = async (req, res) => {
  const { buyer_email } = req.params;
  const { amount } = req.body;
  
  try {
    // Buscar TODAS las GiftCards activas del email, ordenadas por fecha (más antiguas primero)
    const giftcards = await GiftCard.findAll({ 
      where: { 
        buyer_email,
        estado: 'activa'
      },
      order: [['createdAt', 'ASC']] // Usar las más antiguas primero
    });
    
    if (!giftcards || giftcards.length === 0) {
      return res.status(404).json({ message: "No hay GiftCards activas" });
    }
    
    // Calcular saldo total disponible
    const saldoTotal = giftcards.reduce((total, gc) => total + (gc.saldo || 0), 0);
    
    if (saldoTotal < amount) {
      return res.status(400).json({ 
        message: "Saldo insuficiente",
        saldoDisponible: saldoTotal,
        montoRequerido: amount
      });
    }
    
    // Descontar el monto desde las GiftCards (empezando por las más antiguas)
    let montoRestante = amount;
    const giftcardsUsadas = [];
    
    for (const giftcard of giftcards) {
      if (montoRestante <= 0) break;
      
      const saldoAnterior = giftcard.saldo;
      
      if (giftcard.saldo >= montoRestante) {
        // Esta GiftCard tiene suficiente saldo
        giftcard.saldo -= montoRestante;
        montoRestante = 0;
      } else {
        // Usar todo el saldo de esta GiftCard y continuar con la siguiente
        montoRestante -= giftcard.saldo;
        giftcard.saldo = 0;
      }
      
      // Si el saldo quedó en 0, marcar como usada
      if (giftcard.saldo === 0) {
        giftcard.estado = 'usada';
      }
      
      await giftcard.save();
      
      giftcardsUsadas.push({
        id_giftcard: giftcard.id_giftcard,
        saldoAnterior,
        saldoNuevo: giftcard.saldo,
        descontado: saldoAnterior - giftcard.saldo
      });
    }
    
    // Calcular nuevo saldo total
    const nuevoSaldoTotal = giftcards.reduce((total, gc) => total + (gc.saldo || 0), 0);
    
    console.log(`✅ Canje exitoso para ${buyer_email}:`, {
      montoCanjeado: amount,
      saldoAnterior: saldoTotal,
      nuevoSaldo: nuevoSaldoTotal,
      giftcardsAfectadas: giftcardsUsadas
    });
    
    res.json({ 
      saldo: nuevoSaldoTotal,
      montoCanjeado: amount,
      giftcardsAfectadas: giftcardsUsadas
    });
  } catch (error) {
    console.error('❌ Error al canjear saldo:', error);
    res.status(500).json({ message: "Error al canjear saldo" });
  }
};