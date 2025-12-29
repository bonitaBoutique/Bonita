// ================================
// 🇨🇴 UTILIDADES DE FECHA PARA COLOMBIA
// ================================
// Zona horaria: America/Bogota (UTC-5)
// Estas funciones garantizan manejo consistente de fechas en toda la aplicación

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Inicializar plugins de dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Configuración global para Colombia
const COLOMBIA_TIMEZONE = 'America/Bogota';

// ================================
// 🕒 FUNCIONES BÁSICAS DE FECHA
// ================================

/**
 * Obtener fecha actual de Colombia (solo fecha)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getColombiaDate = () => {
  return dayjs().tz(COLOMBIA_TIMEZONE).format('YYYY-MM-DD');
};

/**
 * Obtener fecha y hora actual de Colombia
 * @returns {string} Fecha y hora en formato ISO con zona horaria
 */
export const getColombiaDateTime = () => {
  return dayjs().tz(COLOMBIA_TIMEZONE).toISOString();
};

/**
 * Obtener timestamp actual de Colombia
 * @returns {Date} Objeto Date con hora de Colombia
 */
export const getColombiaDateObject = () => {
  return dayjs().tz(COLOMBIA_TIMEZONE).toDate();
};

// ================================
// 📅 FORMATEO PARA DISPLAY
// ================================

/**
 * Formatear fecha para mostrar en la interfaz
 * @param {string|Date} dateInput - Fecha a formatear
 * @param {boolean} includeTime - Si incluir hora o solo fecha
 * @returns {string} Fecha formateada para mostrar
 */
export const formatDateForDisplay = (dateInput, includeTime = false) => {
  if (!dateInput) return '-';
  
  try {
    let date;
    
    // Si es una fecha ISO con Z (UTC)
    if (typeof dateInput === 'string' && dateInput.includes('Z')) {
      date = dayjs.utc(dateInput).tz(COLOMBIA_TIMEZONE);
    }
    // Si es una fecha ISO con zona horaria
    else if (typeof dateInput === 'string' && (dateInput.includes('+') || dateInput.includes('T'))) {
      date = dayjs(dateInput).tz(COLOMBIA_TIMEZONE);
    }
    // Si es solo fecha (YYYY-MM-DD) - CORRECCIÓN: Parsear sin zona horaria
    else if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // ✅ CORRECCIÓN: No usar .tz() con formato, solo dayjs() para que use la fecha tal cual
      // Agregar hora para forzar interpretación local y evitar conversiones UTC
      date = dayjs(`${dateInput}T12:00:00`);
    }
    // Cualquier otro formato
    else {
      date = dayjs(dateInput).tz(COLOMBIA_TIMEZONE);
    }

    if (includeTime) {
      return date.format('DD/MM/YYYY, HH:mm');
    } else {
      return date.format('DD/MM/YYYY');
    }
  } catch (error) {
    console.error('❌ Error al formatear fecha:', dateInput, error);
    return '-';
  }
};

/**
 * Formatear fecha específicamente para movimientos de stock
 * @param {string|Date} dateInput - Fecha a formatear
 * @returns {string} Fecha formateada para movimientos
 */
export const formatMovementDate = (dateInput) => {
  return formatDateForDisplay(dateInput, true);
};

/**
 * Formatear fecha para inputs HTML (type="date")
 * @param {string|Date} dateInput - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateForInput = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    let date;
    
    if (typeof dateInput === 'string' && dateInput.includes('Z')) {
      date = dayjs.utc(dateInput).tz(COLOMBIA_TIMEZONE);
    } else if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateInput; // Ya está en formato correcto
    } else {
      date = dayjs(dateInput).tz(COLOMBIA_TIMEZONE);
    }
    
    return date.format('YYYY-MM-DD');
  } catch (error) {
    console.error('❌ Error al formatear fecha para input:', dateInput, error);
    return '';
  }
};

// ================================
// 🔧 FUNCIONES DE CONVERSIÓN
// ================================

/**
 * Convertir fecha a formato para backend
 * @param {string|Date} dateInput - Fecha a convertir
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateForBackend = (dateInput) => {
  if (!dateInput) return null;
  
  try {
    // Si ya está en formato YYYY-MM-DD, devolverla tal como está
    if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateInput;
    }
    
    const date = dayjs(dateInput).tz(COLOMBIA_TIMEZONE);
    return date.format('YYYY-MM-DD');
  } catch (error) {
    console.error('❌ Error al formatear fecha para backend:', dateInput, error);
    return null;
  }
};

/**
 * Convertir fecha a ISO con zona horaria de Colombia
 * @param {string|Date} dateInput - Fecha a convertir
 * @returns {string} Fecha en formato ISO con zona horaria
 */
export const toColombiaISO = (dateInput) => {
  if (!dateInput) return null;
  
  try {
    const date = dayjs(dateInput).tz(COLOMBIA_TIMEZONE);
    return date.toISOString();
  } catch (error) {
    console.error('❌ Error al convertir a ISO Colombia:', dateInput, error);
    return null;
  }
};

// ================================
// ✅ FUNCIONES DE VALIDACIÓN
// ================================

/**
 * Validar si una fecha es válida
 * @param {string|Date} dateInput - Fecha a validar
 * @returns {boolean} True si es válida
 */
export const isValidDate = (dateInput) => {
  if (!dateInput) return false;
  return dayjs(dateInput).isValid();
};

/**
 * Validar si una fecha está en el futuro
 * @param {string|Date} dateInput - Fecha a validar
 * @returns {boolean} True si está en el futuro
 */
export const isDateInFuture = (dateInput) => {
  if (!dateInput) return false;
  const inputDate = dayjs(dateInput).tz(COLOMBIA_TIMEZONE);
  const today = dayjs().tz(COLOMBIA_TIMEZONE).startOf('day');
  return inputDate.isAfter(today);
};

/**
 * Validar rango de fechas
 * @param {string} startDate - Fecha de inicio
 * @param {string} endDate - Fecha de fin
 * @returns {object} Resultado de validación
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: false, message: 'Ambas fechas son requeridas' };
  }
  
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { valid: false, message: 'Las fechas no son válidas' };
  }
  
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  
  if (start.isAfter(end)) {
    return { valid: false, message: 'La fecha de inicio no puede ser posterior a la fecha de fin' };
  }
  
  return { valid: true, message: null };
};

// ================================
// 🆕 FUNCIONES DE COMPATIBILIDAD TEMPORAL
// ================================

/**
 * Obtener fecha del servidor desde el estado Redux (compatibilidad temporal)
 * @param {object} serverTime - Estado del servidor desde Redux
 * @returns {string} Fecha del servidor o fecha actual de Colombia
 */
export const getServerDate = (serverTime) => {
  if (serverTime?.current?.date) {
    return serverTime.current.date;
  }
  return getColombiaDate();
};

/**
 * Formatear fecha para input (compatibilidad temporal)
 * @param {object} serverTime - Estado del servidor desde Redux
 * @returns {string} Fecha formateada para input
 */
export const getDateForInput = (serverTime) => {
  return getServerDate(serverTime);
};

/**
 * Validar que la fecha no sea futura según el servidor (compatibilidad temporal)
 * @param {string} dateString - Fecha a validar
 * @param {object} serverTime - Estado del servidor
 * @param {string} fieldName - Nombre del campo para el mensaje
 * @returns {object} Resultado de validación
 */
export const validateDateNotFuture = (dateString, serverTime, fieldName = 'Fecha') => {
  if (!dateString) {
    return {
      valid: false,
      message: `${fieldName} es requerida`
    };
  }

  if (!isValidDate(dateString)) {
    return {
      valid: false,
      message: `${fieldName} no es válida`
    };
  }

  const serverDate = getServerDate(serverTime);
  const inputDate = dayjs(dateString);
  const maxDate = dayjs(serverDate);

  if (inputDate.isAfter(maxDate)) {
    return {
      valid: false,
      message: `${fieldName} no puede ser futura según la fecha del servidor (${formatDateForDisplay(serverDate)})`
    };
  }

  return {
    valid: true,
    message: null
  };
};