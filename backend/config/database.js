// Importamos mongoose para conectarnos a MongoDB
const mongoose = require('mongoose');

/**
 * Función para conectar a MongoDB Atlas
 * Lee la URI desde las variables de entorno
 */
const connectDB = async () => {
  try {
    // Intentamos conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📦 Base de datos: ${mongoose.connection.name}`);
    
  } catch (error) {
    // Si hay error, lo mostramos y detenemos la aplicación
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1); // Salir con error
  }
};

// Exportamos la función para usarla en server.js
module.exports = connectDB;