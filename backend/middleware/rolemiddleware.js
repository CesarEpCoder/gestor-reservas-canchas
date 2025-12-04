/**
 * MIDDLEWARES DE VERIFICACIÓN DE ROLES
 * Verifican que el usuario tenga el rol requerido
 * Estos middlewares se usan DESPUÉS de verificarToken
 */

/**
 * Verifica que el usuario sea SUPERADMIN
 */
const esSuperAdmin = (req, res, next) => {
  // req.user fue agregado por el middleware verificarToken
  if (req.user && req.user.rol === 'superadmin') {
    next(); // Tiene permiso, continuar
  } else {
    res.status(403).json({ 
      error: 'Acceso denegado. Solo superadministradores.' 
    });
  }
};

/**
 * Verifica que el usuario sea ADMIN
 */
const esAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next(); // Tiene permiso, continuar
  } else {
    res.status(403).json({ 
      error: 'Acceso denegado. Solo administradores.' 
    });
  }
};

/**
 * Verifica que el usuario sea USER (cliente normal)
 */
const esUsuario = (req, res, next) => {
  if (req.user && req.user.rol === 'user') {
    next(); // Tiene permiso, continuar
  } else {
    res.status(403).json({ 
      error: 'Acceso denegado. Solo usuarios.' 
    });
  }
};

/**
 * Verifica que el usuario sea ADMIN o SUPERADMIN
 */
const esAdminOSuperAdmin = (req, res, next) => {
  if (req.user && (req.user.rol === 'admin' || req.user.rol === 'superadmin')) {
    next(); // Tiene permiso, continuar
  } else {
    res.status(403).json({ 
      error: 'Acceso denegado. Requiere permisos de administrador.' 
    });
  }
};

// Exportamos todos los middlewares
module.exports = {
  esSuperAdmin,
  esAdmin,
  esUsuario,
  esAdminOSuperAdmin
};