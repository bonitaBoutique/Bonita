const { User, OrderDetail, Receipt, Reservation } = require('../../data');
const response = require('../../utils/response');

exports.getAllClientAccounts = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: OrderDetail,
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
        },
      ],
    });

    response(res, 200, { users });
  } catch (error) {
    console.error(error);
    response(res, 500, "Error al obtener las cuentas de los clientes");
  }
};