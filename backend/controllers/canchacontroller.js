// Importamos los modelos
const Cancha = require('../models/cancha');
const Reserva = require('../models/reserva');
const { sanitizarTexto, validarFormatoHora } = require('../utils/validators');

/**
 * CONTROLADOR DE CANCHAS
 * Funciones para que los admins gestionen sus canchas
 */

/**
 * CREAR NUEVA CANCHA
 * POST /api/canchas/create
 */
const crearCancha = async (req, res) => {
  try {
    // 1. Obtener datos del body
    let { nombre, descripcion, precio, horarios } = req.body;
    
    // 2. Validar campos obligatorios
    if (!nombre || !descripcion || !precio) {
      return res.status(400).json({ 
        error: 'Nombre, descripción y precio son obligatorios.' 
      });
    }
    
    // 3. Validar que haya imagen
    if (!req.imagenUrl) {
      return res.status(400).json({ 
        error: 'La imagen es obligatoria.' 
      });
    }
    
    // 4. Sanitizar inputs
    nombre = sanitizarTexto(nombre);
    descripcion = sanitizarTexto(descripcion);
    
    // 5. Validar precio
    precio = parseFloat(precio);
    if (isNaN(precio) || precio <= 0) {
      return res.status(400).json({ 
        error: 'El precio debe ser un número mayor a 0.' 
      });
    }
    
    // 6. Procesar horarios si se enviaron
    let horariosArray = [];
    if (horarios) {
      try {
        // Si viene como string, parsearlo
        horariosArray = typeof horarios === 'string' ? JSON.parse(horarios) : horarios;
        
        // Validar formato de cada horario
        for (const horario of horariosArray) {
          if (!horario.dia || !horario.horaInicio || !horario.horaFin) {
            return res.status(400).json({ 
              error: 'Cada horario debe tener: dia, horaInicio, horaFin.' 
            });
          }
          
          if (!validarFormatoHora(horario.horaInicio) || !validarFormatoHora(horario.horaFin)) {
            return res.status(400).json({ 
              error: 'Las horas deben estar en formato HH:MM (ej: 09:00)' 
            });
          }
        }
      } catch (error) {
        return res.status(400).json({ 
          error: 'Formato de horarios inválido.' 
        });
      }
    }
    
    // 7. Crear la cancha
    const nuevaCancha = new Cancha({
      nombre,
      descripcion,
      imagenUrl: req.imagenUrl,
      precio,
      adminId: req.user._id, // Del token JWT
      horarios: horariosArray
    });
    
    // 8. Guardar en la base de datos
    await nuevaCancha.save();
    
    // 9. Responder con éxito
    res.status(201).json({
      mensaje: 'Cancha creada exitosamente',
      cancha: nuevaCancha
    });
    
  } catch (error) {
    console.error('Error en crearCancha:', error);
    res.status(500).json({ 
      error: 'Error al crear la cancha.' 
    });
  }
};

/**
 * LISTAR MIS CANCHAS (del admin logueado)
 * GET /api/canchas/mis-canchas
 */
const listarMisCanchas = async (req, res) => {
  try {
    // Buscar canchas del admin logueado
    const canchas = await Cancha.find({ 
      adminId: req.user._id,
      activa: true 
    }).sort({ createdAt: -1 });
    
    res.json({
      total: canchas.length,
      canchas
    });
    
  } catch (error) {
    console.error('Error en listarMisCanchas:', error);
    res.status(500).json({ 
      error: 'Error al listar canchas.' 
    });
  }
};

/**
 * EDITAR CANCHA
 * PUT /api/canchas/edit/:id
 */
const editarCancha = async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre, descripcion, precio, horarios } = req.body;
    
    // 1. Buscar la cancha
    const cancha = await Cancha.findById(id);
    
    if (!cancha) {
      return res.status(404).json({ 
        error: 'Cancha no encontrada.' 
      });
    }
    
    // 2. Verificar que la cancha pertenezca al admin logueado
    if (cancha.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'No tienes permiso para editar esta cancha.' 
      });
    }
    
    // 3. Actualizar campos si se proporcionaron
    if (nombre) {
      cancha.nombre = sanitizarTexto(nombre);
    }
    
    if (descripcion) {
      cancha.descripcion = sanitizarTexto(descripcion);
    }
    
    if (precio) {
      precio = parseFloat(precio);
      if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ 
          error: 'El precio debe ser un número mayor a 0.' 
        });
      }
      cancha.precio = precio;
    }
    
    // 4. Actualizar imagen si se subió una nueva
    if (req.imagenUrl) {
      cancha.imagenUrl = req.imagenUrl;
    }
    
    // 5. Actualizar horarios si se enviaron
    if (horarios) {
      try {
        const horariosArray = typeof horarios === 'string' ? JSON.parse(horarios) : horarios;
        
        // Validar formato
        for (const horario of horariosArray) {
          if (!horario.dia || !horario.horaInicio || !horario.horaFin) {
            return res.status(400).json({ 
              error: 'Cada horario debe tener: dia, horaInicio, horaFin.' 
            });
          }
        }
        
        cancha.horarios = horariosArray;
      } catch (error) {
        return res.status(400).json({ 
          error: 'Formato de horarios inválido.' 
        });
      }
    }
    
    // 6. Guardar cambios
    await cancha.save();
    
    // 7. Responder
    res.json({
      mensaje: 'Cancha actualizada exitosamente',
      cancha
    });
    
  } catch (error) {
    console.error('Error en editarCancha:', error);
    res.status(500).json({ 
      error: 'Error al editar la cancha.' 
    });
  }
};

/**
 * ELIMINAR CANCHA (borrado lógico)
 * DELETE /api/canchas/delete/:id
 */
const eliminarCancha = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Buscar la cancha
    const cancha = await Cancha.findById(id);
    
    if (!cancha) {
      return res.status(404).json({ 
        error: 'Cancha no encontrada.' 
      });
    }
    
    // 2. Verificar que la cancha pertenezca al admin logueado
    if (cancha.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'No tienes permiso para eliminar esta cancha.' 
      });
    }
    
    // 3. Verificar si tiene reservas futuras confirmadas
    const reservasFuturas = await Reserva.countDocuments({
      canchaId: id,
      estado: 'confirmada',
      fecha: { $gte: new Date() }
    });
    
    if (reservasFuturas > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar. Hay ${reservasFuturas} reserva(s) confirmada(s).` 
      });
    }
    
    // 4. Desactivar la cancha (borrado lógico)
    cancha.activa = false;
    await cancha.save();
    
    // 5. Responder
    res.json({
      mensaje: 'Cancha eliminada exitosamente',
      cancha: {
        id: cancha._id,
        nombre: cancha.nombre
      }
    });
    
  } catch (error) {
    console.error('Error en eliminarCancha:', error);
    res.status(500).json({ 
      error: 'Error al eliminar la cancha.' 
    });
  }
};

/**
 * LISTAR TODAS LAS CANCHAS (para usuarios)
 * GET /api/canchas/todas
 */
const listarTodasLasCanchas = async (req, res) => {
  try {
    // Buscar todas las canchas activas de todos los admins
    const canchas = await Cancha.find({ activa: true })
      .populate('adminId', 'nombre email') // Incluir datos del admin
      .sort({ createdAt: -1 });
    
    res.json({
      total: canchas.length,
      canchas
    });
    
  } catch (error) {
    console.error('Error en listarTodasLasCanchas:', error);
    res.status(500).json({ 
      error: 'Error al listar canchas.' 
    });
  }
};

/**
 * VER DISPONIBILIDAD DE UNA CANCHA
 * GET /api/canchas/:id/disponibilidad?fecha=YYYY-MM-DD
 */
const verDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha } = req.query;
    
    // 1. Validar que se envió la fecha
    if (!fecha) {
      return res.status(400).json({ 
        error: 'La fecha es obligatoria (formato: YYYY-MM-DD).' 
      });
    }
    
    // 2. Buscar la cancha
    const cancha = await Cancha.findById(id);
    
    if (!cancha || !cancha.activa) {
      return res.status(404).json({ 
        error: 'Cancha no encontrada.' 
      });
    }
    
    // 3. Convertir fecha a objeto Date
    const fechaBusqueda = new Date(fecha);
    fechaBusqueda.setHours(0, 0, 0, 0);
    
    // Validar que no sea fecha pasada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaBusqueda < hoy) {
      return res.status(400).json({ 
        error: 'No se puede consultar disponibilidad de fechas pasadas.' 
      });
    }
    
    // 4. Obtener el día de la semana
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaSemana = diasSemana[fechaBusqueda.getDay()];
    
    // 5. Buscar horarios definidos para ese día
    const horariosDelDia = cancha.horarios.filter(h => h.dia === diaSemana);
    
    if (horariosDelDia.length === 0) {
      return res.json({
        mensaje: `No hay horarios disponibles para ${diaSemana}`,
        horariosDisponibles: []
      });
    }
    
    // 6. Buscar reservas confirmadas o pendientes para esa fecha
    const reservasDelDia = await Reserva.find({
      canchaId: id,
      fecha: fechaBusqueda,
      estado: { $in: ['confirmada', 'pendiente'] }
    }).select('hora');
    
    // Crear array de horas reservadas
    const horasReservadas = reservasDelDia.map(r => r.hora);
    
    // 7. Generar horarios disponibles
    const horariosDisponibles = [];
    
    for (const horario of horariosDelDia) {
      const [horaInicio, minInicio] = horario.horaInicio.split(':').map(Number);
      const [horaFin, minFin] = horario.horaFin.split(':').map(Number);
      
      // Generar slots de 1 hora
      for (let h = horaInicio; h < horaFin; h++) {
        const horaSlot = `${h.toString().padStart(2, '0')}:${minInicio.toString().padStart(2, '0')}`;
        
        // Si no está reservada, agregarla
        if (!horasReservadas.includes(horaSlot)) {
          horariosDisponibles.push(horaSlot);
        }
      }
    }
    
    // 8. Responder
    res.json({
      cancha: {
        id: cancha._id,
        nombre: cancha.nombre,
        precio: cancha.precio
      },
      fecha,
      dia: diaSemana,
      horariosDisponibles: horariosDisponibles.sort()
    });
    
  } catch (error) {
    console.error('Error en verDisponibilidad:', error);
    res.status(500).json({ 
      error: 'Error al consultar disponibilidad.' 
    });
  }
};

/**
 * VER RESERVAS DE MIS CANCHAS (para admin)
 * GET /api/canchas/mis-reservas
 */
const verReservasDeMisCanchas = async (req, res) => {
  try {
    // 1. Buscar las canchas del admin
    const misCanchas = await Cancha.find({ 
      adminId: req.user._id,
      activa: true 
    }).select('_id');
    
    const idsMisCanchas = misCanchas.map(c => c._id);
    
    // 2. Buscar reservas de esas canchas
    const reservas = await Reserva.find({
      canchaId: { $in: idsMisCanchas },
      estado: 'confirmada'
    })
    .populate('usuarioId', 'nombre email')
    .populate('canchaId', 'nombre precio')
    .sort({ fecha: 1, hora: 1 });
    
    res.json({
      total: reservas.length,
      reservas
    });
    
  } catch (error) {
    console.error('Error en verReservasDeMisCanchas:', error);
    res.status(500).json({ 
      error: 'Error al obtener reservas.' 
    });
  }
};

// Exportamos los controladores
module.exports = {
  crearCancha,
  listarMisCanchas,
  editarCancha,
  eliminarCancha,
  listarTodasLasCanchas,
  verDisponibilidad,
  verReservasDeMisCanchas
};