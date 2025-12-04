// Importamos el SDK de Transbank
const { WebpayPlus } = require('transbank-sdk');

/**
 * Configuración de Webpay Plus para integración (pruebas)
 */

// Exportamos directamente WebpayPlus
// La configuración se hará en cada uso
module.exports = WebpayPlus;

console.log('✅ Webpay SDK cargado correctamente');