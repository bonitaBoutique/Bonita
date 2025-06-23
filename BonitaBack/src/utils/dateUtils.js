const getColombiaDate = () => {
  // ✅ USAR toLocaleString con zona horaria específica
  const now = new Date();
  const colombiaDate = now.toLocaleString('en-CA', { 
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split(',')[0]; // Formato YYYY-MM-DD
  
  return colombiaDate;
};

const getColombiaDateTime = () => {
  // ✅ CREAR FECHA ESPECÍFICA PARA COLOMBIA
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
};

const getColombiaDateTimeISO = () => {
  // ✅ OBTENER FECHA Y HORA COMPLETA EN ISO PARA COLOMBIA
  const now = new Date();
  const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return colombiaTime.toISOString();
};

const formatDateForDB = (dateString) => {
  if (!dateString) return getColombiaDate();
  
  // Si ya es una fecha válida en formato YYYY-MM-DD, la retorna
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // ✅ MEJORAR LA CONVERSIÓN
  try {
    const date = new Date(dateString);
    // Convertir a fecha de Colombia
    return date.toLocaleString('en-CA', { 
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split(',')[0];
  } catch (error) {
    console.error('Error converting date:', error);
    return getColombiaDate();
  }
};

// ✅ NUEVA FUNCIÓN PARA TIMESTAMPS COMPLETOS
const getColombiaTimestamp = () => {
  const now = new Date();
  return now.toLocaleString('sv-SE', { timeZone: 'America/Bogota' }); // YYYY-MM-DD HH:mm:ss
};

// ✅ FUNCIÓN PARA VALIDAR FECHAS
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

module.exports = {
  getColombiaDate,
  getColombiaDateTime,
  getColombiaDateTimeISO,
  formatDateForDB,
  getColombiaTimestamp,
  isValidDate
};