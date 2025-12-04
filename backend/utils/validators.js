/**
 * UTILIDADES DE VALIDACIÓN
 * Funciones reutilizables para validar datos de entrada
 */

/**
 * Valida formato de email
 * @param {String} email - Email a validar
 * @returns {Boolean} - true si es válido
 */
const validarEmail = (email) => {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
};

/**
 * Valida longitud de contraseña
 * @param {String} password - Contraseña a validar
 * @returns {Boolean} - true si tiene al menos 6 caracteres
 */
const validarPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Valida que una fecha no sea pasada
 * @param {Date} fecha - Fecha a validar
 * @returns {Boolean} - true si es hoy o futura
 */
const validarFechaNoVencida = (fecha) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaValidar = new Date(fecha);
  fechaValidar.setHours(0, 0, 0, 0);
  return fechaValidar >= hoy;
};

/**
 * Valida formato de hora (HH:MM)
 * @param {String} hora - Hora a validar
 * @returns {Boolean} - true si tiene formato correcto
 */
const validarFormatoHora = (hora) => {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(hora);
};

/**
 * Sanitiza texto para prevenir inyecciones
 * @param {String} texto - Texto a sanitizar
 * @returns {String} - Texto limpio
 */
const sanitizarTexto = (texto) => {
  if (!texto) return '';
  return texto.trim().replace(/[<>]/g, '');
};

// Exportamos todas las funciones
module.exports = {
  validarEmail,
  validarPassword,
  validarFechaNoVencida,
  validarFormatoHora,
  sanitizarTexto
};