/**
 * UTILIDADES GENERALES
 * Funciones auxiliares reutilizables
 */

/**
 * Cambiar fecha a DD/MM/YYYY
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  // Compensar zona horaria
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() + offset);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Cambiar precio con separador de miles
 */
function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(price);
}

/**
 * Mostrar mensaje de éxito
 */
function showSuccess(message) {
  alert('✅ ' + message);
}

/**
 * Mostrar mensaje de error
 */
function showError(message) {
  alert('❌ ' + message);
}

/**
 * Mostrar loader
 */
function showLoader(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '<p>Cargando...</p>';
  }
}

/**
 * Obtener fecha de hoy en formato YYYY-MM-DD
 */
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Validar email
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validar que una fecha no sea pasada
 */
function isValidFutureDate(dateString) {
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
}