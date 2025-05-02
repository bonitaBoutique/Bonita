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

    // 2. Buscar la GiftCard activa del usuario (insensible a mayúsculas/minúsculas)
    console.log("Buscando GiftCard activa para:", user.email);
    const giftcard = await GiftCard.findOne({
      where: {
        buyer_email: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('buyer_email')),
          '=',
          user.email.toLowerCase()
        ),
        estado: 'activa'
      }
    });
    console.log("GiftCard encontrada:", giftcard ? giftcard.dataValues : null);
    if (!giftcard) {
      console.log("No se encontró GiftCard activa para:", user.email);
      return res.status(404).json({ message: "GiftCard no encontrada o inactiva" });
    }

    // 3. Validar saldo suficiente
    console.log("Saldo actual GiftCard:", giftcard.saldo, "Total a canjear:", totalAmount);
    if (giftcard.saldo < totalAmount) {
      return res.status(400).json({ message: "Saldo insuficiente en la GiftCard" });
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

    // 6. Descontar saldo de la GiftCard
    giftcard.saldo -= totalAmount;
    await giftcard.save();

    // 7. (Opcional) Si el saldo llega a 0, puedes inactivar la GiftCard
    if (giftcard.saldo <= 0) {
      giftcard.estado = 'inactiva';
      await giftcard.save();
    }

    return res.status(200).json({ message: "Canje realizado correctamente", saldoRestante: giftcard.saldo });
  } catch (error) {
    console.error("Error en canje de GiftCard:", error);
    return res.status(500).json({ message: "Error al procesar el canje" });
  }
};