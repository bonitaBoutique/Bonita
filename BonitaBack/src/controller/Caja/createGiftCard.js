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

// Consultar saldo
exports.getGiftCardBalance = async (req, res) => {
  const { buyer_email } = req.params;
  try {
    const giftcard = await GiftCard.findOne({ where: { buyer_email } });
    if (!giftcard) return res.status(404).json({ message: "GiftCard no encontrada" });
    res.json({ saldo: giftcard.saldo });
  } catch (error) {
    res.status(500).json({ message: "Error al consultar saldo" });
  }
};

// Canjear saldo
exports.redeemGiftCard = async (req, res) => {
  const { buyer_email } = req.params;
  const { amount } = req.body;
  try {
    const giftcard = await GiftCard.findOne({ where: { buyer_email } });
    if (!giftcard) return res.status(404).json({ message: "GiftCard no encontrada" });
    if (giftcard.saldo < amount) return res.status(400).json({ message: "Saldo insuficiente" });
    giftcard.saldo -= amount;
    await giftcard.save();
    res.json({ saldo: giftcard.saldo });
  } catch (error) {
    res.status(500).json({ message: "Error al canjear saldo" });
  }
};