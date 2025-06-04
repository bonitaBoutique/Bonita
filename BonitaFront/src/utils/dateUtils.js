// Obtener fecha actual de Colombia
export const getColombiaDate = () => {
  const now = new Date();
  // Obtener fecha en zona horaria de Colombia (UTC-5)
  const colombiaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  return colombiaDate.toISOString().split('T')[0]; // YYYY-MM-DD
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