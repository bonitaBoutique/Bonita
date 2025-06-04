const getColombiaDate = () => {
  const now = new Date();
  // Convertir a zona horaria de Colombia (UTC-5)
  const colombiaTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
  return colombiaTime.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getColombiaDateTime = () => {
  const now = new Date();
  // Convertir a zona horaria de Colombia (UTC-5)
  const colombiaTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
  return colombiaTime;
};

const formatDateForDB = (dateString) => {
  if (!dateString) return getColombiaDate();
  
  // Si ya es una fecha válida en formato YYYY-MM-DD, la retorna
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Si no, intenta convertirla
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

module.exports = {
  getColombiaDate,
  getColombiaDateTime,
  formatDateForDB
};