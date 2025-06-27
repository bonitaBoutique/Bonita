const { 
  getColombiaDebugInfo, 
  getColombiaDateRange,
  getColombiaDate,
  getColombiaDateTime 
} = require('../utils/dateUtils');

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
  getSystemInfo
};