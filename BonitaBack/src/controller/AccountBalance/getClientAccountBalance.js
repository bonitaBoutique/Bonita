const { User, OrderDetail, Receipt, Reservation } = require('../../data');
const response = require('../../utils/response');

exports.getClientAccountBalance = async (req, res) => {
  const { n_document } = req.params;

  try {
    const user = await User.findOne({ where: { n_document } });

    if (!user) {
      return response(res, 404, "Usuario no encontrado");
    }

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

    response(res, 200, { user, orderDetails });
  } catch (error) {
    console.error(error);
    response(res, 500, "Error al obtener el saldo del cliente");
  }
};