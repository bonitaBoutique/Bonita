const { DateTime } = require('luxon'); // ✅ USAR LUXON para mejor manejo de zonas horarias

// ✅ NUEVA IMPLEMENTACIÓN MÁS ROBUSTA
const getColombiaDate = () => {
  // Usar Luxon para obtener fecha exacta de Colombia
  return DateTime.now().setZone('America/Bogota').toISODate(); // YYYY-MM-DD
};

const getColombiaDateTime = () => {
  // Retornar DateTime object de Colombia
  return DateTime.now().setZone('America/Bogota');
};

const getColombiaDateTimeISO = () => {
  // ISO string en zona horaria de Colombia
  return DateTime.now().setZone('America/Bogota').toISO();
};

const getColombiaTimestamp = () => {
  // Timestamp para base de datos
  return DateTime.now().setZone('America/Bogota').toSQL(); // YYYY-MM-DD HH:mm:ss
};

// ✅ NUEVA: Obtener rango de fechas para filtros
const getColombiaDateRange = (startDate = null, endDate = null) => {
  const today = DateTime.now().setZone('America/Bogota');
  
  return {
    start: startDate ? DateTime.fromISO(startDate).setZone('America/Bogota').toISODate() : today.toISODate(),
    end: endDate ? DateTime.fromISO(endDate).setZone('America/Bogota').toISODate() : today.toISODate(),
    todayColombia: today.toISODate(),
    currentTime: today.toISO()
  };
};

// ✅ NUEVA: Para debugging
const getColombiaDebugInfo = () => {
  const now = DateTime.now().setZone('America/Bogota');
  return {
    date: now.toISODate(),
    time: now.toISOTime(),
    iso: now.toISO(),
    readable: now.toLocaleString(DateTime.DATETIME_FULL, { locale: 'es-CO' }),
    timezone: 'America/Bogota',
    offset: now.offset / 60, // Horas de diferencia con UTC
    timestamp: now.toMillis()
  };
};

const formatDateForDB = (dateString) => {
  if (!dateString) return getColombiaDate();
  
  try {
    // ✅ USAR LUXON para conversión consistente
    const date = DateTime.fromISO(dateString).setZone('America/Bogota');
    return date.isValid ? date.toISODate() : getColombiaDate();
  } catch (error) {
    console.error('Error converting date:', error);
    return getColombiaDate();
  }
};

const isValidDate = (dateString) => {
  return DateTime.fromISO(dateString).isValid;
};

module.exports = {
  getColombiaDate,
  getColombiaDateTime,
  getColombiaDateTimeISO,
  formatDateForDB,
  getColombiaTimestamp,
  getColombiaDateRange,
  getColombiaDebugInfo,
  isValidDate
};