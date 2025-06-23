const { Reservation, OrderDetail, User } = require('../../data');
const response = require('../../utils/response');
const { Op } = require('sequelize');

module.exports = async (req, res) => {
  try {
    console.log('Fetching all reservations...');
    
    // ✅ OBTENER PARÁMETROS DE FILTRADO DESDE QUERY
    const { 
      fechaInicio, 
      fechaFin, 
      usuario, 
      documento, 
      soloVencidas = false, 
      soloConDeuda = false 
    } = req.query;

    // ✅ CONSTRUIR CONDICIONES DE FILTRADO
    let whereConditions = {};
    let userWhereConditions = {};

    // Filtro por fecha de creación
    if (fechaInicio || fechaFin) {
      whereConditions.createdAt = {};
      if (fechaInicio) {
        whereConditions.createdAt[Op.gte] = new Date(fechaInicio);
      }
      if (fechaFin) {
        const endDate = new Date(fechaFin);
        endDate.setHours(23, 59, 59, 999); // Incluir todo el día
        whereConditions.createdAt[Op.lte] = endDate;
      }
    }

    // Filtro por documento
    if (documento) {
      whereConditions.n_document = {
        [Op.like]: `%${documento}%`
      };
    }

    // Filtro por usuario (nombre o apellido)
    if (usuario) {
      userWhereConditions[Op.or] = [
        { first_name: { [Op.like]: `%${usuario}%` } },
        { last_name: { [Op.like]: `%${usuario}%` } }
      ];
    }

    const reservations = await Reservation.findAll({
      where: whereConditions,
      include: [
        {
          model: OrderDetail,
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
              where: Object.keys(userWhereConditions).length > 0 ? userWhereConditions : undefined,
              required: Object.keys(userWhereConditions).length > 0 // Solo required si hay filtro de usuario
            }
          ]
        }
      ],
      attributes: [
        'id_reservation',
        'id_orderDetail',
        'n_document',
        'partialPayment',
        'totalPaid',
        'dueDate',
        'status',
        'createdAt',
        'updatedAt',
        'deletedAt'
      ],
      order: [['createdAt', 'DESC']],
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    });

    console.log(`Found ${reservations.length} reservations before filtering`);
    
    const reservationsWithUserData = await Promise.all(
      reservations.map(async (reservation) => {
        const reservationData = reservation.toJSON();
        
        // ✅ FORMATEAR LA FECHA DE VENCIMIENTO PARA COLOMBIA
        if (reservationData.dueDate) {
          const dueDate = new Date(reservationData.dueDate);
          reservationData.dueDateFormatted = dueDate.toLocaleDateString('es-CO', {
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
          
          // ✅ VERIFICAR SI LA RESERVA ESTÁ VENCIDA
          const today = new Date();
          const colombiaToday = new Date(today.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
          reservationData.isOverdue = dueDate < colombiaToday;
        } else {
          reservationData.dueDateFormatted = 'Sin fecha de vencimiento';
          reservationData.isOverdue = false;
        }

        // ✅ CALCULAR DEUDA PENDIENTE
        const totalOrderAmount = reservationData.OrderDetail?.amount || 0;
        const totalPaid = reservationData.totalPaid || 0;
        reservationData.pendingDebt = totalOrderAmount - totalPaid;

        // ✅ FORMATEAR FECHA DE CREACIÓN
        reservationData.createdAtFormatted = new Date(reservationData.createdAt).toLocaleDateString('es-CO', {
          timeZone: 'America/Bogota',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        
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

    // ✅ APLICAR FILTROS ADICIONALES
    let filteredReservations = reservationsWithUserData;

    // Filtrar solo vencidas
    if (soloVencidas === 'true') {
      filteredReservations = filteredReservations.filter(r => r.isOverdue);
    }

    // Filtrar solo con deuda pendiente mayor a 0
    if (soloConDeuda === 'true') {
      filteredReservations = filteredReservations.filter(r => r.pendingDebt > 0);
    }

    console.log(`Returning ${filteredReservations.length} reservations after filtering`);

    return response(res, 200, { 
      reservations: filteredReservations,
      total: filteredReservations.length,
      filters: {
        fechaInicio,
        fechaFin,
        usuario,
        documento,
        soloVencidas,
        soloConDeuda
      }
    });
    
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return response(res, 500, { 
      error: "Internal server error",
      message: error.message 
    });
  }
};