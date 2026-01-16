const { Receipt, User, Product, GiftCard, conn } = require("../../data");
const sequelize = conn;

module.exports = async (req, res) => {
  const { n_document } = req.params;
  const { items, totalAmount } = req.body;

  console.log("Body recibido en canje:", req.body);

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: "El campo 'items' debe ser un array." });
  }

  try {
    // 1. Buscar el usuario
    const user = await User.findOne({ where: { n_document } });
    console.log("Usuario encontrado para canje:", user ? user.email : null);
    if (!user) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // 2. Buscar TODAS las GiftCards activas del usuario (insensible a mayúsculas/minúsculas)
    console.log("Buscando GiftCards activas para:", user.email);
    const giftcards = await GiftCard.findAll({
      where: {
        buyer_email: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('buyer_email')),
          '=',
          user.email.toLowerCase()
        ),
        estado: 'activa'
      },
      order: [['createdAt', 'ASC']] // Usar las más antiguas primero
    });
    
    console.log(`GiftCards encontradas (${giftcards.length}):`, giftcards.map(gc => ({ 
      id: gc.id_giftcard, 
      saldo: gc.saldo 
    })));
    
    if (!giftcards || giftcards.length === 0) {
      console.log("No se encontró GiftCard activa para:", user.email);
      return res.status(404).json({ message: "GiftCard no encontrada o inactiva" });
    }

    // 3. Validar saldo suficiente (suma de todas las GiftCards)
    const saldoTotal = giftcards.reduce((total, gc) => total + gc.saldo, 0);
    console.log("Saldo total de GiftCards:", saldoTotal, "Total a canjear:", totalAmount);
    
    if (saldoTotal < totalAmount) {
      return res.status(400).json({ message: "Saldo insuficiente en las GiftCards" });
    }

    // 4. Validar stock de productos
    for (const item of items) {
      const product = await Product.findByPk(item.id_product);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.id_product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para ${product.description}` });
      }
    }

    // 5. Restar stock
    for (const item of items) {
      const product = await Product.findByPk(item.id_product);
      await product.update({ stock: product.stock - item.quantity });
    }

    // 6. Descontar saldo de las GiftCards (usando las más antiguas primero)
    let montoRestante = totalAmount;
    const giftcardsUsadas = [];
    
    for (const giftcard of giftcards) {
      if (montoRestante <= 0) break; // Ya se cubrió el monto total
      
      const montoADescontar = Math.min(giftcard.saldo, montoRestante);
      giftcard.saldo -= montoADescontar;
      montoRestante -= montoADescontar;
      
      // Si el saldo llega a 0, inactivar la GiftCard
      if (giftcard.saldo <= 0) {
        giftcard.estado = 'inactiva';
      }
      
      await giftcard.save();
      
      giftcardsUsadas.push({
        id: giftcard.id_giftcard,
        descontado: montoADescontar,
        saldoRestante: giftcard.saldo,
        estado: giftcard.estado
      });
      
      console.log(`✅ GiftCard ${giftcard.id_giftcard}: Descontado ${montoADescontar}, Saldo restante: ${giftcard.saldo}, Estado: ${giftcard.estado}`);
    }

    return res.status(200).json({ 
      message: "Canje realizado correctamente", 
      giftcardsUsadas,
      saldoTotalRestante: giftcards.reduce((total, gc) => total + gc.saldo, 0)
    });
  } catch (error) {
    console.error("Error en canje de GiftCard:", error);
    return res.status(500).json({ message: "Error al procesar el canje" });
  }
};