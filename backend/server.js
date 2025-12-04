// Cargamos las variables de entorno PRIMERO
require('dotenv').config();

// Importamos las dependencias
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Creamos la aplicación Express
const app = express();

// Definimos el puerto (desde .env o 5000 por defecto)
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================

// CORS: Permitir peticiones desde el frontend
app.use(cors());

// Parser de JSON: Para leer body de las peticiones
app.use(express.json());

// Parser de URL encoded: Para formularios
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static('frontend'));

// ==========================================
// RUTAS
// ==========================================

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    mensaje: '✅ Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Importar rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const canchaRoutes = require('./routes/canchas');
app.use('/api/canchas', canchaRoutes);

const reservaRoutes = require('./routes/reservas');
app.use('/api/reservas', reservaRoutes);

// ==========================================
// MANEJO DE ERRORES GLOBAL
// ==========================================

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});

// Middleware para errores del servidor
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ 
    error: err.message || 'Error interno del servidor' 
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // 1. Conectar a la base de datos
    await connectDB();
    
    // 2. Iniciar el servidor
    app.listen(PORT, () => {
      console.log('==========================================');
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🧪 Ruta de prueba: http://localhost:${PORT}/api/test`);
      console.log('==========================================');
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();