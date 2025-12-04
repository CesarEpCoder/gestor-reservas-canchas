// Importamos jsonwebtoken para verificar tokens
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * Verifica que el usuario tenga un token JWT válido
 * Agrega los datos del usuario a req.user
 */
const verificarToken = async (req, res, next) => {
  try {
    // 1. Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    // Verificar que el header exista y tenga el formato correcto
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No autorizado. Token no proporcionado.' 
      });
    }
    
    // 2. Extraer el token (quitar "Bearer ")
    const token = authHeader.split(' ')[1];
    
    // 3. Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Buscar el usuario en la base de datos
    const usuario = await User.findById(decoded.id).select('-password');
    
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Token válido pero usuario no existe.' 
      });
    }
    
    // 5. Agregar el usuario a la request
    req.user = usuario;
    
    // 6. Continuar con la siguiente función
    next();
    
  } catch (error) {
    // Manejar errores específicos de JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado. Por favor inicia sesión nuevamente.' 
      });
    }
    
    // Error genérico
    console.error('Error en verificarToken:', error);
    return res.status(500).json({ 
      error: 'Error al verificar autenticación.' 
    });
  }
};

// Exportamos el middleware
module.exports = verificarToken;