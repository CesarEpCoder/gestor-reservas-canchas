// Importamos el modelo de Usuario
const User = require('../models/user');
const { validarEmail, validarPassword, sanitizarTexto } = require('../utils/validators');

/**
 * CONTROLADOR DE ADMINISTRACIÓN DE ADMINS
 * Solo el SuperAdmin puede usar estas funciones
 */

/**
 * CREAR UN NUEVO ADMIN
 * POST /api/admin/create
 */
const crearAdmin = async (req, res) => {
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
    
    // 7. Crear el nuevo admin (rol 'admin')
    const nuevoAdmin = new User({
      nombre,
      email,
      password,
      rol: 'admin' // Forzamos el rol a admin
    });
    
    // 8. Guardar en la base de datos
    await nuevoAdmin.save();
    
    // 9. Responder con éxito
    res.status(201).json({
      mensaje: 'Administrador creado exitosamente',
      admin: {
        id: nuevoAdmin._id,
        nombre: nuevoAdmin.nombre,
        email: nuevoAdmin.email,
        rol: nuevoAdmin.rol,
        createdAt: nuevoAdmin.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error en crearAdmin:', error);
    res.status(500).json({ 
      error: 'Error al crear administrador.' 
    });
  }
};

/**
 * LISTAR TODOS LOS ADMINS
 * GET /api/admin/list
 */
const listarAdmins = async (req, res) => {
  try {
    // Buscar solo usuarios con rol 'admin'
    const admins = await User.find({ rol: 'admin' })
      .select('-password') // No incluir contraseñas
      .sort({ createdAt: -1 }); // Más recientes primero
    
    res.json({
      total: admins.length,
      admins
    });
    
  } catch (error) {
    console.error('Error en listarAdmins:', error);
    res.status(500).json({ 
      error: 'Error al listar administradores.' 
    });
  }
};

/**
 * EDITAR UN ADMIN
 * PUT /api/admin/edit/:id
 */
const editarAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre, email, password } = req.body;
    
    // 1. Buscar el admin
    const admin = await User.findById(id);
    
    if (!admin) {
      return res.status(404).json({ 
        error: 'Administrador no encontrado.' 
      });
    }
    
    // 2. Verificar que sea admin (no permitir editar superadmin)
    if (admin.rol !== 'admin') {
      return res.status(400).json({ 
        error: 'Solo se pueden editar administradores, no superadministradores.' 
      });
    }
    
    // 3. Actualizar campos si se proporcionaron
    if (nombre) {
      admin.nombre = sanitizarTexto(nombre);
    }
    
    if (email) {
      email = email.trim().toLowerCase();
      
      // Validar formato
      if (!validarEmail(email)) {
        return res.status(400).json({ 
          error: 'El formato del email no es válido.' 
        });
      }
      
      // Verificar que el email no esté en uso por otro usuario
      const emailEnUso = await User.findOne({ email, _id: { $ne: id } });
      if (emailEnUso) {
        return res.status(400).json({ 
          error: 'El email ya está en uso por otro usuario.' 
        });
      }
      
      admin.email = email;
    }
    
    if (password) {
      // Validar longitud
      if (!validarPassword(password)) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres.' 
        });
      }
      
      admin.password = password; // El middleware pre-save hasheará automáticamente
    }
    
    // 4. Guardar cambios
    await admin.save();
    
    // 5. Responder
    res.json({
      mensaje: 'Administrador actualizado exitosamente',
      admin: {
        id: admin._id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
        updatedAt: admin.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error en editarAdmin:', error);
    res.status(500).json({ 
      error: 'Error al editar administrador.' 
    });
  }
};

/**
 * ELIMINAR UN ADMIN
 * DELETE /api/admin/delete/:id
 */
const eliminarAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Buscar el admin
    const admin = await User.findById(id);
    
    if (!admin) {
      return res.status(404).json({ 
        error: 'Administrador no encontrado.' 
      });
    }
    
    // 2. Verificar que sea admin (no permitir eliminar superadmin)
    if (admin.rol !== 'admin') {
      return res.status(400).json({ 
        error: 'Solo se pueden eliminar administradores, no superadministradores.' 
      });
    }
    
    // 3. Eliminar el admin
    await User.findByIdAndDelete(id);
    
    // 4. Responder
    res.json({
      mensaje: 'Administrador eliminado exitosamente',
      admin: {
        id: admin._id,
        nombre: admin.nombre,
        email: admin.email
      }
    });
    
  } catch (error) {
    console.error('Error en eliminarAdmin:', error);
    res.status(500).json({ 
      error: 'Error al eliminar administrador.' 
    });
  }
};

// Exportamos los controladores
module.exports = {
  crearAdmin,
  listarAdmins,
  editarAdmin,
  eliminarAdmin
};