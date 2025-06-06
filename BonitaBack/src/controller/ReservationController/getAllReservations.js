const { Reservation, OrderDetail, User } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    console.log('Fetching all reservations...');
    
    const reservations = await Reservation.findAll({
      include: [
        {
          model: OrderDetail,
          // ✅ AGREGAR más atributos necesarios del OrderDetail
          attributes: [
            'id_orderDetail', 
            'amount', 
            'n_document', 
            'date', 
            'state_order'
          ],
          include: [
            {
              model: User,
              attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone'],
              // ✅ HACER la relación opcional por si no hay User asociado
              required: false
            }
          ]
        }
      ],
      // ✅ AGREGAR atributos específicos de Reservation
      attributes: [
        'id_reservation',
        'totalPaid',
        'createdAt',
        'updatedAt'
      ],
      // ✅ ORDENAR por fecha más reciente
      order: [['createdAt', 'DESC']],
      // ✅ REMOVER logging en producción o hacer condicional
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    });

    console.log(`Found ${reservations.length} reservations`);
    
    // ✅ AGREGAR información adicional en la respuesta
    const reservationsWithUserData = await Promise.all(
      reservations.map(async (reservation) => {
        const reservationData = reservation.toJSON();
        
        // ✅ Si no hay User en OrderDetail, buscarlo por n_document
        if (!reservationData.OrderDetail.User && reservationData.OrderDetail.n_document) {
          const user = await User.findOne({
            where: { n_document: reservationData.OrderDetail.n_document },
            attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone']
          });
          
          if (user) {
            reservationData.OrderDetail.User = user.toJSON();
          }
        }
        
        return reservationData;
      })
    );

    return response(res, 200, { 
      reservations: reservationsWithUserData,
      total: reservations.length 
    });
    
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return response(res, 500, { 
      error: "Internal server error",
      message: error.message 
    });
  }
};