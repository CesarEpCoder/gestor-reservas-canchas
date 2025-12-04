// Importamos Express Router
const express = require('express');
const router = express.Router();

// Importamos los controladores
const { 
  registrarUsuario, 
  loginUsuario,
  obtenerPerfil 
} = require('../controllers/authcontroller');

// Importamos el middleware de autenticación
const verificarToken = require('../middleware/authmiddleware');

/**
 * RUTAS DE AUTENTICACIÓN
 * Prefijo: /api/auth
 */

/**
 * POST /api/auth/register
 * Registrar nuevo usuario (rol: user)
 * Público - No requiere autenticación
 */
router.post('/register', registrarUsuario);

/**
 * POST /api/auth/login
 * Iniciar sesión
 * Público - No requiere autenticación
 */
router.post('/login', loginUsuario);

/**
 * GET /api/auth/perfil
 * Obtener datos del usuario logueado
 * Privado - Requiere token JWT
 */
router.get('/perfil', verificarToken, obtenerPerfil);

// Exportamos el router
module.exports = router;