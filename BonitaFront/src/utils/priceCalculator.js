/**
 * Utilidad: Price Calculator
 * Descripción: Funciones para calcular precios con descuentos de promociones
 * Autor: Sistema de Promociones
 */

/**
 * Calcula el precio con descuento aplicado
 * @param {number} originalPrice - Precio original del producto
 * @param {number} discountPercentage - Porcentaje de descuento (0-100)
 * @returns {number} - Precio con descuento aplicado, redondeado
 */
export const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  const price = parseFloat(originalPrice);
  const discount = parseFloat(discountPercentage);
  
  if (isNaN(price) || isNaN(discount)) {
    return originalPrice;
  }
  
  if (discount <= 0) {
    return price;
  }
  
  if (discount >= 100) {
    return 0;
  }
  
  const discountAmount = (price * discount) / 100;
  const finalPrice = price - discountAmount;
  
  return Math.round(finalPrice); // Redondear al entero más cercano
};

/**
 * Calcula el monto ahorrado con el descuento
 * @param {number} originalPrice - Precio original
 * @param {number} discountPercentage - Porcentaje de descuento
 * @returns {number} - Cantidad ahorrada
 */
export const calculateSavings = (originalPrice, discountPercentage) => {
  const price = parseFloat(originalPrice);
  const discount = parseFloat(discountPercentage);
  
  if (isNaN(price) || isNaN(discount) || discount <= 0) {
    return 0;
  }
  
  const savings = (price * discount) / 100;
  return Math.round(savings);
};

/**
 * Formatea un precio como moneda colombiana
 * @param {number} price - Precio a formatear
 * @param {boolean} includeDecimals - Si incluir decimales (default: false)
 * @returns {string} - Precio formateado
 */
export const formatPrice = (price, includeDecimals = false) => {
  const parsedPrice = parseFloat(price);
  
  if (isNaN(parsedPrice)) {
    return '$0';
  }
  
  const options = {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  };
  
  return `$${parsedPrice.toLocaleString('es-CO', options)}`;
};

/**
 * Verifica si una promoción está vigente según sus fechas
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @returns {boolean} - true si está vigente
 */
export const isPromotionValid = (startDate, endDate) => {
  const now = new Date();
  
  // Si no tiene fechas, está vigente
  if (!startDate && !endDate) {
    return true;
  }
  
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  const isAfterStart = !start || now >= start;
  const isBeforeEnd = !end || now <= end;
  
  return isAfterStart && isBeforeEnd;
};

/**
 * Obtiene el texto de ahorro para mostrar al usuario
 * @param {number} savings - Cantidad ahorrada
 * @param {number} discountPercentage - Porcentaje de descuento
 * @returns {string} - Texto formateado
 */
export const getSavingsText = (savings, discountPercentage) => {
  if (savings <= 0) return '';
  
  return `¡Ahorras ${formatPrice(savings)}! (${discountPercentage}% OFF)`;
};

/**
 * Calcula el precio final de un producto considerando promoción activa
 * @param {number} originalPrice - Precio original
 * @param {object|null} activePromotion - Objeto de promoción activa (o null)
 * @returns {object} - { finalPrice, hasDiscount, savings, percentage }
 */
export const getPriceWithPromotion = (originalPrice, activePromotion) => {
  if (!activePromotion || !activePromotion.discount_percentage) {
    return {
      finalPrice: parseFloat(originalPrice),
      hasDiscount: false,
      savings: 0,
      percentage: 0,
    };
  }
  
  const discountPercentage = parseFloat(activePromotion.discount_percentage);
  const finalPrice = calculateDiscountedPrice(originalPrice, discountPercentage);
  const savings = calculateSavings(originalPrice, discountPercentage);
  
  return {
    finalPrice,
    hasDiscount: discountPercentage > 0,
    savings,
    percentage: discountPercentage,
  };
};

export default {
  calculateDiscountedPrice,
  calculateSavings,
  formatPrice,
  isPromotionValid,
  getSavingsText,
  getPriceWithPromotion,
};
