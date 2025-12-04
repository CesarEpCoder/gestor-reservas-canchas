// Importamos el modelo de Usuario
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { validarEmail, validarPassword, sanitizarTexto } = require('../utils/validators');

/**
 * CONTROLADOR DE AUTENTICACIÓN
 * Maneja registro y login de usuarios
 */

/**
 * REGISTRO DE NUEVO USUARIO
 * POST /api/auth/register
 */
const registrarUsuario = async (req, res) => {
  try {
    // 1. Obtener datos del body
    let { nombre, email, password } = req.body;
    
    // 2. Validar que todos los campos existan
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios (nombre, email, password).' 
      });
    }
    
    // 3. Sanitizar inputs
    nombre = sanitizarTexto(nombre);
    email = email.trim().toLowerCase();
    
    // 4. Validar formato de email
    if (!validarEmail(email)) {
      return res.status(400).json({ 
        error: 'El formato del email no es válido.' 
      });
    }
    
    // 5. Validar longitud de contraseña
    if (!validarPassword(password)) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres.' 
      });
    }
    
    // 6. Verificar que el email no exista
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'El email ya está registrado.' 
      });
    }
    
    // 7. Crear el nuevo usuario (rol 'user' por defecto)
    const nuevoUsuario = new User({
      nombre,
      email,
      password, // El modelo hashea automáticamente la contraseña
      rol: 'user' // Solo usuarios normales pueden registrarse aquí
    });
    
    // 8. Guardar en la base de datos
    await nuevoUsuario.save();
    
    // 9. Responder con éxito (sin enviar password)
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });
    
  } catch (error) {
    console.error('Error en registrarUsuario:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario.' 
    });
  }
};

/**
 * LOGIN DE USUARIO
 * POST /api/auth/login
 */
const loginUsuario = async (req, res) => {
  try {
    // 1. Obtener credenciales del body
    let { email, password } = req.body;
    
    // 2. Validar que ambos campos existan
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son obligatorios.' 
      });
    }
    
    // 3. Normalizar email
    email = email.trim().toLowerCase();
    
    // 4. Buscar usuario por email (incluir password para comparar)
    const usuario = await User.findOne({ email }).select('+password');
    
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas.' 
      });
    }
    
    // 5. Verificar contraseña
    const passwordCorrecta = await usuario.compararPassword(password);
    
    if (!passwordCorrecta) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas.' 
      });
    }
    
    // 6. Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token válido por 7 días
    );
    
    // 7. Responder con token y datos del usuario
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
    
  } catch (error) {
    console.error('Error en loginUsuario:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión.' 
    });
  }
};

/**
 * OBTENER PERFIL DEL USUARIO LOGUEADO
 * GET /api/auth/perfil
 */
const obtenerPerfil = async (req, res) => {
  try {
    // req.user fue agregado por el middleware verificarToken
    res.json({
      usuario: req.user
    });
  } catch (error) {
    console.error('Error en obtenerPerfil:', error);
    res.status(500).json({ 
      error: 'Error al obtener perfil.' 
    });
  }
};

// Exportamos los controladores
module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil
};