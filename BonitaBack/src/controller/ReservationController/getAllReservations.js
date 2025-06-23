const { Reservation, OrderDetail, User } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    console.log('Fetching all reservations...');
    
    // ✅ PRIMERO VERIFICAR QUE CAMPOS TIENE LA TABLA
    const reservations = await Reservation.findAll({
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
              required: false
            }
          ]
        }
      ],
      // ✅ USAR * PARA VER TODOS LOS CAMPOS DISPONIBLES
      // attributes: ['*'], // ✅ TEMPORAL: para ver qué campos existen realmente
      order: [['createdAt', 'DESC']],
      logging: console.log // ✅ ACTIVAR LOGGING para ver la query SQL
    });

    console.log(`Found ${reservations.length} reservations`);
    console.log('✅ CAMPOS DISPONIBLES EN RESERVATION:', Object.keys(reservations[0]?.dataValues || {}));
    
    const reservationsWithUserData = await Promise.all(
      reservations.map(async (reservation) => {
        const reservationData = reservation.toJSON();
        
        // ✅ DEBUG: VER TODOS LOS CAMPOS DE LA RESERVA
        console.log('🔍 CAMPOS DE RESERVATION:', Object.keys(reservationData));
        console.log('🔍 RESERVATION COMPLETA:', reservationData);
        
        // ✅ VERIFICAR SI EXISTE dueDate CON OTROS NOMBRES POSIBLES
        const possibleDueDateFields = ['dueDate', 'due_date', 'vencimiento', 'fecha_vencimiento'];
        let dueDate = null;
        
        for (const field of possibleDueDateFields) {
          if (reservationData[field]) {
            dueDate = reservationData[field];
            console.log(`✅ ENCONTRADO CAMPO DE FECHA: ${field} = ${dueDate}`);
            break;
          }
        }
        
        // ✅ VERIFICAR SI EXISTE status CON OTROS NOMBRES POSIBLES  
        const possibleStatusFields = ['status', 'estado', 'state'];
        let status = null;
        
        for (const field of possibleStatusFields) {
          if (reservationData[field]) {
            status = reservationData[field];
            console.log(`✅ ENCONTRADO CAMPO DE ESTADO: ${field} = ${status}`);
            break;
          }
        }
        
        // ✅ FORMATEAR LA FECHA DE VENCIMIENTO PARA COLOMBIA
        if (dueDate) {
          const dueDateObj = new Date(dueDate);
          reservationData.dueDateFormatted = dueDateObj.toLocaleDateString('es-CO', {
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
          
          // ✅ VERIFICAR SI LA RESERVA ESTÁ VENCIDA
          const today = new Date();
          const colombiaToday = new Date(today.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
          reservationData.isOverdue = dueDateObj < colombiaToday;
          
          // ✅ AGREGAR EL CAMPO NORMALIZADO
          reservationData.dueDate = dueDate;
        } else {
          // ✅ SI NO HAY FECHA DE VENCIMIENTO, CREAR UNA POR DEFECTO
          console.warn(`❌ NO SE ENCONTRÓ FECHA DE VENCIMIENTO para reserva ${reservationData.id_reservation}`);
          reservationData.dueDate = null;
          reservationData.dueDateFormatted = 'Sin fecha de vencimiento';
          reservationData.isOverdue = false;
        }
        
        // ✅ AGREGAR EL ESTADO NORMALIZADO
        reservationData.status = status || 'Pendiente';
        
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