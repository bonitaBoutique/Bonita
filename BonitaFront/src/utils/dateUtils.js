// Obtener fecha actual de Colombia
export const getColombiaDate = () => {
  const now = new Date();
  // Obtener fecha en zona horaria de Colombia (UTC-5)
  const colombiaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  return colombiaDate.toISOString().split('T')[0]; // YYYY-MM-DD
};

// ✅ Formatear fecha para enviar al backend
export const formatDateForBackend = (dateString) => {
  if (!dateString) return null;
  
  // Asegurar que la fecha se interprete en zona horaria de Colombia
  // Formato: YYYY-MM-DD -> YYYY-MM-DD (sin conversión de zona horaria)
  return dateString; // Ya está en formato correcto YYYY-MM-DD
};

// Formatear fecha para mostrar en español
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Validar que la fecha sea válida
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Comparar fechas (útil para validaciones)
export const isDateInFuture = (dateString) => {
  if (!dateString) return false;
  const inputDate = new Date(dateString + 'T00:00:00');
  const today = new Date(getColombiaDate() + 'T00:00:00');
  return inputDate > today;
};

// ✅ Función CORREGIDA para formatear fechas de movimientos
export const formatMovementDate = (dateString) => {
  if (!dateString) return "-";
  
  try {
    console.log("🕒 Fecha raw recibida:", dateString);
    
    // ✅ CASO 1: Solo fecha (YYYY-MM-DD) - NO convertir zona horaria
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log("📅 Detectada fecha simple (solo fecha):", dateString);
      
      // ✅ Interpretar como fecha local de Colombia, no UTC
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0);
      
      const formatted = date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' 00:00';
      
      console.log("✅ Fecha formateada como local:", formatted);
      return formatted;
    }
    
    // ✅ CASO 2: Fecha con hora completa (ISO string o similar)
    if (dateString.includes('T') || dateString.includes(' ')) {
      console.log("📅 Detectada fecha con hora:", dateString);
      
      const dayjs = require('dayjs');
      const utc = require('dayjs/plugin/utc');
      const timezone = require('dayjs/plugin/timezone');
      
      dayjs.extend(utc);
      dayjs.extend(timezone);
      
      // ✅ Verificar si tiene zona horaria explícita
      const hasTimezone = dateString.includes('Z') || dateString.includes('+') || dateString.includes('-05:00');
      
      let formatted;
      
      if (hasTimezone) {
        // ✅ Tiene zona horaria, convertir a Colombia
        formatted = dayjs(dateString).tz("America/Bogota").format("DD/MM/YYYY HH:mm");
        console.log("✅ Convertida de UTC a Colombia:", formatted);
      } else {
        // ✅ No tiene zona horaria, asumir que ya es hora local de Colombia
        formatted = dayjs(dateString).format("DD/MM/YYYY HH:mm");
        console.log("✅ Interpretada como hora local:", formatted);
      }
      
      return formatted;
    }
    
    // ✅ CASO 3: Formato desconocido, usar como está
    console.log("❓ Formato desconocido, usando tal como está");
    return dateString;
    
  } catch (error) {
    console.error("❌ Error al formatear fecha:", dateString, error);
    return dateString;
  }
};

// ✅ Obtener fecha y hora actual de Colombia para timestamps
export const getColombiaDateTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
};

// ✅ Convertir fecha a formato ISO manteniendo zona horaria de Colombia
export const toColombiaISO = (dateString) => {
  if (!dateString) return null;
  
  // Si ya tiene zona horaria, mantenerla
  if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+'))) {
    return dateString;
  }
  
  // Si es solo fecha (YYYY-MM-DD), agregar hora de Colombia
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString + 'T00:00:00-05:00'; // Colombia UTC-5
  }
  
  return dateString;
};