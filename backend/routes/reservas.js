// Importamos Express Router
const express = require('express');
const router = express.Router();

// Importamos los controladores
const {
  crearReserva,
  webpayReturn,
  verMisReservas,
  obtenerDetalleReserva,
  cancelarReserva
} = require('../controllers/reservacontroller');

// Importamos middlewares
const verificarToken = require('../middleware/authmiddleware');
const { esUsuario } = require('../middleware/rolemiddleware');

/**
 * RUTAS DE RESERVAS
 * Prefijo: /api/reservas
 */

/**
 * POST /api/reservas/crear
 * Crear nueva reserva y generar pago en Webpay
 * Solo usuarios
 */
router.post('/crear', verificarToken, esUsuario, crearReserva);

/**
 * GET /api/reservas/webpay-return
 * Retorno desde Webpay después del pago
 * Ruta pública (Webpay la llama)
 */
router.get('/webpay-return', webpayReturn);

/**
 * GET /api/reservas/mis-reservas
 * Ver todas las reservas del usuario logueado
 * Solo usuarios
 */
router.get('/mis-reservas', verificarToken, esUsuario, verMisReservas);

/**
 * GET /api/reservas/:id
 * Ver detalle de una reserva específica
 * Solo usuarios (dueño de la reserva)
 */
router.get('/:id', verificarToken, esUsuario, obtenerDetalleReserva);

/**
 * DELETE /api/reservas/cancelar/:id
 * Cancelar una reserva pendiente
 * Solo usuarios (dueño de la reserva)
 */
router.delete('/cancelar/:id', verificarToken, esUsuario, cancelarReserva);

// Exportamos el router
module.exports = router;