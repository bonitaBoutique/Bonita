const { Reservation, OrderDetail, User } = require('../../data');
const response = require('../../utils/response');
const { Op } = require('sequelize');

module.exports = async (req, res) => {
  try {
    console.log('🟣 [RESERVATIONS] Fetching all reservations...');
    console.log('🟣 [RESERVATIONS] Query params:', req.query);
    
    // ✅ OBTENER PARÁMETROS DE FILTRADO DESDE QUERY
    const { 
      fechaInicio, 
      fechaFin, 
      usuario, 
      documento, 
      soloVencidas = false, 
      soloConDeuda = false,
      status,           
      state_order       
    } = req.query;

    // ✅ CONSTRUIR CONDICIONES DE FILTRADO
    let whereConditions = {};
    let orderWhereConditions = {};
    let userWhereConditions = {};

    // ✅ Filtro por fecha de creación
    if (fechaInicio || fechaFin) {
      whereConditions.createdAt = {};
      if (fechaInicio) {
        whereConditions.createdAt[Op.gte] = new Date(fechaInicio);
        console.log('🟣 [RESERVATIONS] Filtro fechaInicio:', fechaInicio);
      }
      if (fechaFin) {
        const endDate = new Date(fechaFin);
        endDate.setHours(23, 59, 59, 999);
        whereConditions.createdAt[Op.lte] = endDate;
        console.log('🟣 [RESERVATIONS] Filtro fechaFin:', fechaFin);
      }
    }

    // ✅ Filtro por documento
    if (documento) {
      whereConditions.n_document = {
        [Op.like]: `%${documento}%`
      };
      console.log('🟣 [RESERVATIONS] Filtro documento:', documento);
    }

    // ✅ Filtro por status de la reserva
    if (status) {
      whereConditions.status = status;
      console.log('🟣 [RESERVATIONS] Filtro status:', status);
    }

    // ✅ Filtro por estado de la orden
    if (state_order) {
      orderWhereConditions.state_order = state_order;
      console.log('🟣 [RESERVATIONS] Filtro state_order:', state_order);
    }

    // ✅ Filtro por usuario (nombre o apellido)
    if (usuario) {
      userWhereConditions[Op.or] = [
        { first_name: { [Op.iLike]: `%${usuario}%` } }, // iLike para PostgreSQL (case insensitive)
        { last_name: { [Op.iLike]: `%${usuario}%` } }
      ];
      console.log('🟣 [RESERVATIONS] Filtro usuario:', usuario);
    }

    console.log('🟣 [RESERVATIONS] Where conditions:', whereConditions);
    console.log('🟣 [RESERVATIONS] Order where conditions:', orderWhereConditions);
    console.log('🟣 [RESERVATIONS] User where conditions:', userWhereConditions);

    // ✅ CONSULTA PRINCIPAL CON MANEJO DE ERRORES MEJORADO
    let reservations = [];
    
    try {
      reservations = await Reservation.findAll({
        where: whereConditions,
        include: [
          {
            model: OrderDetail,
            attributes: [
              'id_orderDetail', 
              'amount', 
              'n_document', 
              'date', 
              'state_order',
              'transaction_status',
              'pointOfSale'
            ],
            where: Object.keys(orderWhereConditions).length > 0 ? orderWhereConditions : undefined,
            required: true, // ✅ INNER JOIN para asegurar que siempre haya OrderDetail
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
          'updatedAt'
        ],
        order: [['createdAt', 'DESC']],
        logging: process.env.NODE_ENV === 'development' ? console.log : false
      });
    } catch (queryError) {
      console.error('🔴 [RESERVATIONS] Error in main query:', queryError);
      
      // ✅ FALLBACK: Consulta más simple sin filtros de usuario
      console.log('🟡 [RESERVATIONS] Attempting fallback query without user filters...');
      
      reservations = await Reservation.findAll({
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
            where: Object.keys(orderWhereConditions).length > 0 ? orderWhereConditions : undefined,
            required: true
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
          'updatedAt'
        ],
        order: [['createdAt', 'DESC']],
        logging: false
      });
    }

    console.log(`🟢 [RESERVATIONS] Found ${reservations.length} reservations before processing`);
    
    // ✅ PROCESAR DATOS DE RESERVAS
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
          
          // ✅ CALCULAR DÍAS HASTA VENCIMIENTO
          const diffTime = dueDate - colombiaToday;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          reservationData.daysUntilDue = diffDays;
        } else {
          reservationData.dueDateFormatted = 'Sin fecha de vencimiento';
          reservationData.isOverdue = false;
          reservationData.daysUntilDue = null;
        }

        // ✅ CALCULAR DEUDA PENDIENTE
        const totalOrderAmount = reservationData.OrderDetail?.amount || 0;
        const totalPaid = reservationData.totalPaid || 0;
        reservationData.remainingAmount = totalOrderAmount - totalPaid;
        reservationData.pendingDebt = Math.max(0, totalOrderAmount - totalPaid);

        // ✅ FORMATEAR FECHA DE CREACIÓN
        if (reservationData.createdAt) {
          reservationData.createdAtFormatted = new Date(reservationData.createdAt).toLocaleDateString('es-CO', {
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        }
        
        // ✅ BUSCAR USUARIO SI NO ESTÁ INCLUIDO Y APLICAR FILTRO DE USUARIO MANUALMENTE
        if (!reservationData.OrderDetail?.User && reservationData.OrderDetail?.n_document) {
          try {
            const user = await User.findOne({
              where: { n_document: reservationData.OrderDetail.n_document },
              attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone']
            });
            
            if (user) {
              reservationData.OrderDetail.User = user.toJSON();
            }
          } catch (userError) {
            console.log('🟡 [RESERVATIONS] Error buscando usuario:', userError.message);
          }
        }

        // ✅ APLICAR FILTRO DE USUARIO MANUALMENTE SI ES NECESARIO
        if (usuario && reservationData.OrderDetail?.User) {
          const userFullName = `${reservationData.OrderDetail.User.first_name} ${reservationData.OrderDetail.User.last_name}`.toLowerCase();
          const searchTerm = usuario.toLowerCase();
          
          if (!userFullName.includes(searchTerm)) {
            return null; // Filtrar este resultado
          }
        }
        
        return reservationData;
      })
    );

    // ✅ FILTRAR RESULTADOS NULOS
    let filteredReservations = reservationsWithUserData.filter(r => r !== null);

    // ✅ APLICAR FILTROS ADICIONALES
    if (soloVencidas === 'true') {
      filteredReservations = filteredReservations.filter(r => r.isOverdue === true);
      console.log(`🟣 [RESERVATIONS] Filtered to overdue only: ${filteredReservations.length}`);
    }

    if (soloConDeuda === 'true') {
      filteredReservations = filteredReservations.filter(r => r.pendingDebt > 0);
      console.log(`🟣 [RESERVATIONS] Filtered to pending debt only: ${filteredReservations.length}`);
    }

    // ✅ ESTADÍSTICAS
    const statistics = {
      total: filteredReservations.length,
      pendientes: filteredReservations.filter(r => r.status === 'Pendiente').length,
      completadas: filteredReservations.filter(r => r.status === 'Completada').length,
      canceladas: filteredReservations.filter(r => r.status === 'Cancelada').length,
      vencidas: filteredReservations.filter(r => r.isOverdue).length,
      conDeuda: filteredReservations.filter(r => r.pendingDebt > 0).length,
      totalDeuda: filteredReservations.reduce((sum, r) => sum + (r.pendingDebt || 0), 0)
    };

    console.log(`🟢 [RESERVATIONS] Returning ${filteredReservations.length} reservations after filtering`);
    console.log(`🟢 [RESERVATIONS] Statistics:`, statistics);

    return response(res, 200, { 
      success: true,
      reservations: filteredReservations,
      total: filteredReservations.length,
      statistics,
      filters: {
        fechaInicio,
        fechaFin,
        usuario,
        documento,
        soloVencidas,
        soloConDeuda,
        status,
        state_order
      }
    });
    
  } catch (error) {
    console.error("🔴 [RESERVATIONS] Error fetching reservations:", error);
    console.error("🔴 [RESERVATIONS] Stack trace:", error.stack);
    
    return response(res, 500, { 
      success: false,
      error: "Error interno del servidor",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};