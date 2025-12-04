// Importamos mongoose para crear el modelo
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * SCHEMA DE USUARIO
 * Define la estructura de los usuarios en la base de datos
 * Roles: superadmin, admin, user
 */
const userSchema = new mongoose.Schema({
  
  // Nombre completo del usuario
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  
  // Email único para login
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'El email no es válido']
  },
  
  // Contraseña hasheada
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  
  // Rol del usuario: superadmin, admin o user
  rol: {
    type: String,
    enum: {
      values: ['superadmin', 'admin', 'user'],
      message: 'El rol debe ser: superadmin, admin o user'
    },
    default: 'user'
  }

}, {
  // Agregar timestamps automáticos (createdAt, updatedAt)
  timestamps: true
});

/**
 * MIDDLEWARE PRE-SAVE
 * Hashea la contraseña antes de guardarla en la base de datos
 * Solo si la contraseña fue modificada
 */
userSchema.pre('save', async function(next) {
  // Si la contraseña no fue modificada, continuar
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generar salt 
    const salt = await bcrypt.genSalt(10);
    
    // Hashear la contraseña
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * MÉTODO PARA COMPARAR CONTRASEÑAS
 * Compara la contraseña ingresada con la hasheada en la BD
 * @param {String} passwordIngresado - Contraseña en texto plano
 * @returns {Boolean} - true si coinciden, false si no
 */
userSchema.methods.compararPassword = async function(passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.password);
};

/**
 * MÉTODO PARA OCULTAR CONTRASEÑA EN RESPUESTAS JSON
 * Cuando se devuelve un usuario, no incluir el password
 */
userSchema.methods.toJSON = function() {
  const usuario = this.toObject();
  delete usuario.password;
  return usuario;
};

// Creamos y exportamos el modelo
const User = mongoose.model('User', userSchema);

module.exports = User;