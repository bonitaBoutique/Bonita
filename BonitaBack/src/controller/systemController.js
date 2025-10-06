const { 
  getColombiaDebugInfo, 
  getColombiaDateRange,
  getColombiaDate,
  getColombiaDateTime 
} = require('../utils/dateUtils');

const { Reservation, OrderDetail } = require('../data');

// ✅ Actualizar reservas con saldo 0 a estado "Completada"
const updateCompletedReservations = async (req, res) => {
  try {
    console.log('🔄 [SYSTEM] Iniciando actualización de reservas completadas...');

    // Obtener todas las reservas con saldo 0 y estado != Completada
    const reservations = await Reservation.findAll({
      where: {
        status: ['Pendiente', 'Cancelada'], // Excluimos las ya completadas
      },
      include: [{
        model: OrderDetail,
        attributes: ['amount'],
        required: true,
      }],
    });

    console.log(`📊 [SYSTEM] Total de reservas encontradas: ${reservations.length}`);

    // Filtrar las que tienen saldo 0
    const toUpdate = reservations.filter(r => {
      const saldo = r.OrderDetail.amount - r.totalPaid;
      return saldo <= 0;
    });

    console.log(`📋 [SYSTEM] Reservas con saldo 0 a actualizar: ${toUpdate.length}`);

    if (toUpdate.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay reservas para actualizar',
        updated: 0,
      });
    }

    // Actualizar cada una
    const updatePromises = toUpdate.map(reservation => {
      console.log(`✅ [SYSTEM] Actualizando reserva ${reservation.id_reservation}`);
      return reservation.update({ status: 'Completada' });
    });

    await Promise.all(updatePromises);

    console.log(`✅ [SYSTEM] ${toUpdate.length} reservas actualizadas correctamente`);

    return res.status(200).json({
      success: true,
      message: `${toUpdate.length} reservas actualizadas a estado Completada`,
      updated: toUpdate.length,
      reservations: toUpdate.map(r => ({
        id: r.id_reservation,
        n_document: r.n_document,
        totalPaid: r.totalPaid,
        orderAmount: r.OrderDetail.amount,
      })),
    });

  } catch (error) {
    console.error('❌ [SYSTEM] Error actualizando reservas:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al actualizar reservas',
      details: error.message,
    });
  }
};

// ✅ Obtener fecha/hora actual del servidor (Colombia)
const getServerTime = async (req, res) => {
  try {
    console.log('🕒 [SYSTEM] Solicitando hora del servidor...');
    
    const timeInfo = getColombiaDebugInfo();
    
    console.log('🕒 [SYSTEM] Hora de Colombia:', timeInfo);
    
    res.status(200).json({
      success: true,
      data: timeInfo,
      message: 'Hora del servidor obtenida exitosamente (zona horaria de Colombia)'
    });
    
  } catch (error) {
    console.error('❌ [SYSTEM] Error obteniendo hora del servidor:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error obteniendo hora del servidor',
      error: error.message
    });
  }
};

// ✅ Obtener rango de fechas calculado en servidor
const getDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    console.log('📅 [SYSTEM] Calculando rango de fechas:', { startDate, endDate });
    
    const dateRange = getColombiaDateRange(startDate, endDate);
    
    console.log('📅 [SYSTEM] Rango calculado:', dateRange);
    
    res.status(200).json({
      success: true,
      data: dateRange,
      message: 'Rango de fechas calculado exitosamente en zona horaria de Colombia'
    });
    
  } catch (error) {
    console.error('❌ [SYSTEM] Error calculando rango de fechas:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error calculando rango de fechas',
      error: error.message
    });
  }
};

// ✅ Información general del sistema
const getSystemInfo = async (req, res) => {
  try {
    const systemInfo = {
      name: 'Bonita System',
      version: '1.0.0',
      timezone: 'America/Bogota',
      environment: process.env.NODE_ENV || 'development',
      currentTime: getColombiaDebugInfo(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform
    };
    
    console.log('ℹ️ [SYSTEM] Información del sistema solicitada');
    
    res.status(200).json({
      success: true,
      data: systemInfo,
      message: 'Información del sistema obtenida exitosamente'
    });
    
  } catch (error) {
    console.error('❌ [SYSTEM] Error obteniendo información del sistema:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error obteniendo información del sistema',
      error: error.message
    });
  }
};

module.exports = {
  getServerTime,
  getDateRange,
  getSystemInfo,
  updateCompletedReservations
};