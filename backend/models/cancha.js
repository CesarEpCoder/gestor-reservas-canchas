// Importamos mongoose para crear el modelo
const mongoose = require('mongoose');

/**
 * SCHEMA DE CANCHA
 * Define la estructura de las canchas en la base de datos
 * Cada cancha pertenece a un admin
 */
const canchaSchema = new mongoose.Schema({
  
  // Nombre de la cancha
  nombre: {
    type: String,
    required: [true, 'El nombre de la cancha es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  
  // Descripción de la cancha
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    minlength: [10, 'La descripción debe tener al menos 10 caracteres']
  },
  
  // URL de la imagen subida a Cloudinary
  imagenUrl: {
    type: String,
    required: [true, 'La imagen es obligatoria']
  },
  
  // Precio por hora de la cancha
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  
  // ID del admin dueño de la cancha (referencia a User)
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El admin es obligatorio']
  },
  
  // Array de horarios disponibles
  // Cada horario tiene: día, horaInicio, horaFin
  horarios: [{
    dia: {
      type: String,
      enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      required: true
    },
    horaInicio: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    },
    horaFin: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    }
  }],
  
  // Estado de la cancha (activa/inactiva)
  activa: {
    type: Boolean,
    default: true
  }

}, {
  // Agregar timestamps automáticos (createdAt, updatedAt)
  timestamps: true
});

/**
 * ÍNDICE COMPUESTO
 * Para buscar canchas por admin más rápido
 */
canchaSchema.index({ adminId: 1, activa: 1 });

/**
 * MÉTODO VIRTUAL PARA OBTENER EL ADMIN POBLADO
 * Permite hacer populate automáticamente
 */
canchaSchema.virtual('admin', {
  ref: 'User',
  localField: 'adminId',
  foreignField: '_id',
  justOne: true
});

// Configurar para incluir virtuals en JSON
canchaSchema.set('toJSON', { virtuals: true });
canchaSchema.set('toObject', { virtuals: true });

// Creamos y exportamos el modelo
const Cancha = mongoose.model('Cancha', canchaSchema);

module.exports = Cancha;