const { User, OrderDetail, Receipt, Reservation, GiftCard } = require('../../data'); // ✅ AGREGAR: GiftCard
const response = require('../../utils/response');

exports.getClientAccountBalance = async (req, res) => {
  const { n_document } = req.params;

  try {
    const user = await User.findOne({ where: { n_document } });

    if (!user) {
      return response(res, 404, "Usuario no encontrado");
    }

    // ✅ OBTENER: OrderDetails del usuario
    const orderDetails = await OrderDetail.findAll({
      where: { n_document: user.n_document },
      include: [
        {
          model: Receipt,
          attributes: ['id_receipt', 'total_amount', 'date'],
        },
        {
          model: Reservation,
          attributes: ['id_reservation', 'totalPaid', 'dueDate', 'status'],
        },
      ],
    });

    // ✅ AGREGAR: GiftCards del usuario (por email)
    const giftCards = await GiftCard.findAll({
      where: { buyer_email: user.email },
      attributes: [
        'id_giftcard', 
        'saldo', 
        'estado', 
        'payment_method',
        'description',
        'reference_id',
        'reference_type',
        'createdAt',
        'updatedAt'
      ],
      order: [['createdAt', 'DESC']] // ✅ ORDENAR: Más recientes primero
    });

    console.log(`📧 GiftCards encontradas para ${user.email}:`, giftCards.length);

    response(res, 200, { 
      user, 
      orderDetails,
      giftCards // ✅ AGREGAR: GiftCards en la respuesta
    });
  } catch (error) {
    console.error(error);
    response(res, 500, "Error al obtener el saldo del cliente");
  }
};