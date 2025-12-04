// Importamos mongoose para crear el modelo
const mongoose = require('mongoose');

/**
 * SCHEMA DE RESERVA
 * Define la estructura de las reservas en la base de datos
 * Cada reserva conecta un usuario con una cancha en una fecha/hora específica
 */
const reservaSchema = new mongoose.Schema({
  
  // ID del usuario que reserva (referencia a User)
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  
  // ID de la cancha reservada (referencia a Cancha)
  canchaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cancha',
    required: [true, 'La cancha es obligatoria']
  },
  
  // Fecha de la reserva (solo fecha, sin hora)
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria'],
    validate: {
      validator: function(valor) {
        // No permitir fechas pasadas
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return valor >= hoy;
      },
      message: 'No se pueden hacer reservas en fechas pasadas'
    }
  },
  
  // Hora de inicio de la reserva (formato HH:MM)
  hora: {
    type: String,
    required: [true, 'La hora es obligatoria'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
  },
  
  // Estado de la reserva
  estado: {
    type: String,
    enum: {
      values: ['pendiente', 'confirmada', 'cancelada'],
      message: 'El estado debe ser: pendiente, confirmada o cancelada'
    },
    default: 'pendiente'
  },
  
  // Monto pagado (se toma del precio de la cancha)
  monto: {
    type: Number,
    required: [true, 'El monto es obligatorio'],
    min: [0, 'El monto no puede ser negativo']
  },
  
  // Token de Webpay (se guarda cuando se crea la transacción)
  webpayToken: {
    type: String,
    default: null
  },
  
  // Datos de la transacción de Webpay cuando se confirma
  datosPago: {
    type: String,
    default: null
  },
  
  // Fecha de expiración para reservas pendientes (10 minutos)
  expiraEn: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); 
    }
  }

}, {
  // Agregar timestamps automáticos (createdAt, updatedAt)
  timestamps: true
});

/**
 * ÍNDICE ÚNICO COMPUESTO
 * Evita que se pueda reservar la misma cancha a la misma hora y fecha
 * Solo para reservas confirmadas o pendientes
 */
reservaSchema.index(
  { canchaId: 1, fecha: 1, hora: 1, estado: 1 },
  { 
    unique: true,
    partialFilterExpression: { estado: { $in: ['pendiente', 'confirmada'] } }
  }
);

/**
 * ÍNDICE PARA BUSCAR RESERVAS POR USUARIO
 */
reservaSchema.index({ usuarioId: 1, estado: 1 });

/**
 * ÍNDICE PARA BUSCAR RESERVAS POR CANCHA
 */
reservaSchema.index({ canchaId: 1, fecha: 1, estado: 1 });

/**
 * ÍNDICE TTL (Time To Live)
 * Elimina automáticamente reservas pendientes expiradas después de 10 minutos
 */
reservaSchema.index(
  { expiraEn: 1 },
  { 
    expireAfterSeconds: 0,
    partialFilterExpression: { estado: 'pendiente' }
  }
);

/**
 * MÉTODO VIRTUAL PARA VERIFICAR SI LA RESERVA EXPIRÓ
 */
reservaSchema.virtual('estaExpirada').get(function() {
  return this.estado === 'pendiente' && this.expiraEn < new Date();
});

/**
 * MÉTODO PARA POPULAR USUARIO Y CANCHA
 */
reservaSchema.methods.popularDatos = async function() {
  await this.populate('usuarioId', 'nombre email');
  await this.populate('canchaId', 'nombre descripcion imagenUrl precio');
  return this;
};

// Configurar para incluir virtuals en JSON
reservaSchema.set('toJSON', { virtuals: true });
reservaSchema.set('toObject', { virtuals: true });

// Creamos y exportamos el modelo
const Reserva = mongoose.model('Reserva', reservaSchema);

module.exports = Reserva;