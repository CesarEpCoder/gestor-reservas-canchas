// Importamos Express Router
const express = require('express');
const router = express.Router();

// Importamos los controladores
const { 
  crearAdmin,
  listarAdmins,
  editarAdmin,
  eliminarAdmin
} = require('../controllers/admincontroller');

// Importamos middlewares
const verificarToken = require('../middleware/authmiddleware');
const { esSuperAdmin } = require('../middleware/rolemiddleware');

/**
 * RUTAS DE GESTIÓN DE ADMINS
 * Prefijo: /api/admin
 * TODAS las rutas requieren ser SuperAdmin
 */

/**
 * POST /api/admin/create
 * Crear nuevo administrador
 * Solo SuperAdmin
 */
router.post('/create', verificarToken, esSuperAdmin, crearAdmin);

/**
 * GET /api/admin/list
 * Listar todos los administradores
 * Solo SuperAdmin
 */
router.get('/list', verificarToken, esSuperAdmin, listarAdmins);

/**
 * PUT /api/admin/edit/:id
 * Editar un administrador por ID
 * Solo SuperAdmin
 */
router.put('/edit/:id', verificarToken, esSuperAdmin, editarAdmin);

/**
 * DELETE /api/admin/delete/:id
 * Eliminar un administrador por ID
 * Solo SuperAdmin
 */
router.delete('/delete/:id', verificarToken, esSuperAdmin, eliminarAdmin);

// Exportamos el router
module.exports = router;