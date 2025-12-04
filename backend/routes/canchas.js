// Importamos Express Router
const express = require('express');
const router = express.Router();

// Importamos los controladores
const {
  crearCancha,
  listarMisCanchas,
  editarCancha,
  eliminarCancha,
  listarTodasLasCanchas,
  verDisponibilidad,
  verReservasDeMisCanchas
} = require('../controllers/canchacontroller');

// Importamos middlewares
const verificarToken = require('../middleware/authmiddleware');
const { esAdmin } = require('../middleware/rolemiddleware');
const { upload, subirImagenCloudinary } = require('../middleware/uploadmiddleware');

/**
 * RUTAS DE CANCHAS
 * Prefijo: /api/canchas
 */

// ==========================================
// RUTAS PARA ADMIN
// ==========================================

/**
 * POST /api/canchas/create
 * Crear nueva cancha con imagen
 * Solo Admin
 */
router.post(
  '/create',
  verificarToken,
  esAdmin,
  upload, // Multer procesa el archivo
  subirImagenCloudinary, // Sube a Cloudinary
  crearCancha
);

/**
 * GET /api/canchas/mis-canchas
 * Listar canchas del admin logueado
 * Solo Admin
 */
router.get('/mis-canchas', verificarToken, esAdmin, listarMisCanchas);

/**
 * PUT /api/canchas/edit/:id
 * Editar cancha por ID
 * Solo Admin (dueño de la cancha)
 */
router.put(
  '/edit/:id',
  verificarToken,
  esAdmin,
  upload,
  subirImagenCloudinary,
  editarCancha
);

/**
 * DELETE /api/canchas/delete/:id
 * Eliminar cancha por ID
 * Solo Admin (dueño de la cancha)
 */
router.delete('/delete/:id', verificarToken, esAdmin, eliminarCancha);

/**
 * GET /api/canchas/mis-reservas
 * Ver reservas de mis canchas
 * Solo Admin
 */
router.get('/mis-reservas', verificarToken, esAdmin, verReservasDeMisCanchas);

// ==========================================
// RUTAS PARA USUARIOS
// ==========================================

/**
 * GET /api/canchas/todas
 * Listar todas las canchas disponibles
 * Requiere autenticación
 */
router.get('/todas', verificarToken, listarTodasLasCanchas);

/**
 * GET /api/canchas/:id/disponibilidad
 * Ver horarios disponibles de una cancha en una fecha
 * Requiere autenticación
 */
router.get('/:id/disponibilidad', verificarToken, verDisponibilidad);

// Exportamos el router
module.exports = router;