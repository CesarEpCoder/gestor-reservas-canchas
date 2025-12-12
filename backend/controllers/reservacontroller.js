// Importamos los modelos
const Reserva = require('../models/reserva');
const Cancha = require('../models/cancha');
const { WebpayPlus } = require('transbank-sdk'); 
const { validarFechaNoVencida, validarFormatoHora } = require('../utils/validators');

/**
 * CONTROLADOR DE RESERVAS
 * Funciones para que los usuarios gestionen reservas y pagos
 */

/**
 * CREAR RESERVA Y GENERAR PAGO
 * POST /api/reservas/crear
 */
const crearReserva = async (req, res) => {
  try {
    const { canchaId, fecha, hora } = req.body;
    
    // 1. Validar campos obligatorios
    if (!canchaId || !fecha || !hora) {
      return res.status(400).json({ 
        error: 'Cancha, fecha y hora son obligatorios.' 
      });
    }
    
    // 2. Validar formato de hora
    if (!validarFormatoHora(hora)) {
      return res.status(400).json({ 
        error: 'La hora debe estar en formato HH:MM (ej: 14:00)' 
      });
    }
    
    // 3. Validar que la fecha no sea pasada
    if (!validarFechaNoVencida(fecha)) {
      return res.status(400).json({ 
        error: 'No se pueden hacer reservas en fechas pasadas.' 
      });
    }
    
    // 4. Buscar la cancha
    const cancha = await Cancha.findById(canchaId);
    
    if (!cancha || !cancha.activa) {
      return res.status(404).json({ 
        error: 'Cancha no encontrada o no disponible.' 
      });
    }
    
    // 5. Convertir fecha a objeto Date (CORREGIDO)
    const [year, month, day] = fecha.split('-');
    const fechaReserva = new Date(year, month - 1, day);
    fechaReserva.setHours(0, 0, 0, 0);
    
    // 6. Verificar que el horario esté disponible
    const reservaExistente = await Reserva.findOne({
      canchaId,
      fecha: fechaReserva,
      hora,
      estado: { $in: ['pendiente', 'confirmada'] }
    });
    
    if (reservaExistente) {
      return res.status(400).json({ 
        error: 'Este horario ya está reservado.' 
      });
    }
    
    // 7. Crear la reserva con estado "pendiente"
    const nuevaReserva = new Reserva({
      usuarioId: req.user._id,
      canchaId,
      fecha: fechaReserva,
      hora,
      estado: 'pendiente',
      monto: cancha.precio
    });
    
    await nuevaReserva.save();
    
    // 8. Crear transacción en Webpay (ambiente de integración)
    try {
      //Webpay para integración
      const tx = new WebpayPlus.Transaction();
      
      // URLs de retorno
      const returnUrl = `http://localhost:5000/api/reservas/webpay-return`;
      
      // Crear la transacción
      const createResponse = await tx.create(
        `${nuevaReserva._id}`.substring(0, 26), // buyOrder (máximo 26 caracteres)
        `SESSION-${nuevaReserva._id}`, 
        cancha.precio, 
        returnUrl 
      );
      
      console.log('✅ Transacción Webpay creada:', createResponse);
      
      // Guardar el token de Webpay en la reserva
      nuevaReserva.webpayToken = createResponse.token;
      await nuevaReserva.save();
      
      // 9. Responder con la URL de pago
      res.status(201).json({
        mensaje: 'Reserva creada. Procede al pago con Webpay.',
        reserva: {
          id: nuevaReserva._id,
          cancha: cancha.nombre,
          fecha: nuevaReserva.fecha,
          hora: nuevaReserva.hora,
          monto: nuevaReserva.monto,
          estado: nuevaReserva.estado
        },
        pago: {
          url: createResponse.url + '?token_ws=' + createResponse.token,
          token: createResponse.token
        }
      });
      
    } catch (webpayError) {
      console.error('❌ Error al crear transacción Webpay:', webpayError);
      console.error('Detalle del error:', webpayError.message);
      
      // Si falla Webpay, eliminar la reserva
      await Reserva.findByIdAndDelete(nuevaReserva._id);
      
      return res.status(500).json({ 
        error: 'Error al procesar el pago con Webpay.',
        detalle: webpayError.message
      });
    }
    
  } catch (error) {
    console.error('❌ Error en crearReserva:', error);
    res.status(500).json({ 
      error: 'Error al crear la reserva.',
      detalle: error.message
    });
  }
};

/**
 * WEBPAY RETURN (cuando el usuario vuelve de pagar)
 * GET /api/reservas/webpay-return
 */
const webpayReturn = async (req, res) => {
  try {
    const token_ws = req.query.token_ws;
    
    console.log('📥 Retorno de Webpay con token:', token_ws);
    
    if (!token_ws) {
      console.log('❌ No se recibió token de Webpay');
      return res.redirect('http://localhost:5000/user/pago-fallido.html');
    }
    
    // Confirmar la transacción con Webpay
    const tx = new WebpayPlus.Transaction();
    const commitResponse = await tx.commit(token_ws);
    
    console.log('✅ Respuesta de confirmación Webpay:', commitResponse);
    
    // Buscar la reserva por token
    const reserva = await Reserva.findOne({ webpayToken: token_ws });
    
    if (!reserva) {
      console.log('❌ No se encontró reserva con ese token');
      return res.redirect('http://localhost:5000/user/pago-fallido.html');
    }
    
    // Verificar el estado del pago
    if (commitResponse.status === 'AUTHORIZED' && commitResponse.response_code === 0) {
      // PAGO EXITOSO
      console.log('✅ Pago AUTORIZADO');
      
      reserva.estado = 'confirmada';
      reserva.datosPago = JSON.stringify({
        authorizationCode: commitResponse.authorization_code,
        transactionDate: commitResponse.transaction_date,
        cardNumber: commitResponse.card_detail?.card_number || 'N/A',
        amount: commitResponse.amount
      });
      
      await reserva.save();
      
      // Redirigir a página de éxito
      return res.redirect(`http://localhost:5000/user/pago-exitoso.html?reservaId=${reserva._id}`);
      
    } else {
      // PAGO RECHAZADO
      console.log('❌ Pago RECHAZADO. Status:', commitResponse.status, 'Code:', commitResponse.response_code);
      
      reserva.estado = 'cancelada';
      reserva.datosPago = JSON.stringify({
        status: commitResponse.status,
        responseCode: commitResponse.response_code
      });
      
      await reserva.save();
      
      return res.redirect('http://localhost:5000/user/pago-fallido.html');
    }
    
  } catch (error) {
    console.error('Error en webpayReturn:', error);
    console.error('Detalle:', error.message);
    return res.redirect('http://localhost:5000/user/pago-fallido.html');
  }
};

/**
 * VER MIS RESERVAS (usuario logueado)
 * GET /api/reservas/mis-reservas
 */
const verMisReservas = async (req, res) => {
  try {
    // Buscar reservas del usuario logueado
    const reservas = await Reserva.find({ 
      usuarioId: req.user._id 
    })
    .populate('canchaId', 'nombre descripcion imagenUrl precio')
    .sort({ fecha: -1, hora: -1 });
    
    res.json({
      total: reservas.length,
      reservas
    });
    
  } catch (error) {
    console.error('Error en verMisReservas:', error);
    res.status(500).json({ 
      error: 'Error al obtener reservas.' 
    });
  }
};

/**
 * OBTENER DETALLES DE UNA RESERVA
 * GET /api/reservas/:id
 */
const obtenerDetalleReserva = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la reserva
    const reserva = await Reserva.findById(id)
      .populate('usuarioId', 'nombre email')
      .populate('canchaId', 'nombre descripcion imagenUrl precio');
    
    if (!reserva) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada.' 
      });
    }
    
    // Verificar que la reserva pertenezca al usuario logueado
    if (reserva.usuarioId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'No tienes permiso para ver esta reserva.' 
      });
    }
    
    res.json({ reserva });
    
  } catch (error) {
    console.error('Error en obtenerDetalleReserva:', error);
    res.status(500).json({ 
      error: 'Error al obtener la reserva.' 
    });
  }
};

/**
 * CANCELAR RESERVA PENDIENTE
 * DELETE /api/reservas/cancelar/:id
 */
const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la reserva
    const reserva = await Reserva.findById(id);
    
    if (!reserva) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada.' 
      });
    }
    
    // Verificar que pertenezca al usuario
    if (reserva.usuarioId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'No tienes permiso para cancelar esta reserva.' 
      });
    }
    
    // Solo se pueden cancelar reservas pendientes
    if (reserva.estado !== 'pendiente') {
      return res.status(400).json({ 
        error: 'Solo se pueden cancelar reservas pendientes.' 
      });
    }
    
    // Cancelar la reserva
    reserva.estado = 'cancelada';
    await reserva.save();
    
    res.json({
      mensaje: 'Reserva cancelada exitosamente',
      reserva
    });
    
  } catch (error) {
    console.error('Error en cancelarReserva:', error);
    res.status(500).json({ 
      error: 'Error al cancelar la reserva.' 
    });
  }
};

// Exportamos los controladores
module.exports = {
  crearReserva,
  webpayReturn,
  verMisReservas,
  obtenerDetalleReserva,
  cancelarReserva
};