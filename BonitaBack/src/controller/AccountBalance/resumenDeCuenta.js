const { User, OrderDetail, Reservation, CreditPayment, Invoice, Receipt, Payment, GiftCard } = require("../../data");
const { Op } = require("sequelize");

module.exports = async (req, res) => {
  const { n_document } = req.params;

  try {
    // Buscar usuario
    const user = await User.findOne({ where: { n_document } });
    console.log("Buscando usuario con n_document:", n_document, "Resultado:", user);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Buscar todas las órdenes del usuario, incluyendo todo lo relacionado
    const orders = await OrderDetail.findAll({
      where: { n_document },
      include: [
        {
          model: Reservation,
          include: [{ model: CreditPayment }],
        },
        { model: Invoice },
        {
          model: Receipt,
          include: [
            { model: Payment },
            { model: User, as: "cashier" },
          ],
        },
        { model: Payment },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Buscar reservas directas por n_document
    const reservations = await Reservation.findAll({
      where: { n_document },
      include: [
        { model: OrderDetail, include: [{ model: User }] },
        { model: CreditPayment },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Buscar recibos donde el cliente es el comprador (por email, nombre o teléfono)
    const receipts = await Receipt.findAll({
      where: {
        [Op.or]: [
          { buyer_email: user.email },
          { buyer_name: `${user.first_name} ${user.last_name}` },
          { buyer_phone: user.phone },
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    // GiftCards por email del usuario
    const giftcards = await GiftCard.findAll({
      where: { buyer_email: user.email },
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      user,
      orders,
      reservations,
      receipts,
      giftcards,
    });
  } catch (error) {
    console.error("Error al obtener resumen de cuenta:", error);
    return res.status(500).json({ message: "Error al obtener resumen de cuenta" });
  }
};