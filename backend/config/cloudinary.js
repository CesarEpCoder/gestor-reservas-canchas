// Importamos cloudinary v2
const cloudinary = require('cloudinary').v2;

/**
 * Configuración de Cloudinary
 * Lee las credenciales desde variables de entorno
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Exportamos cloudinary configurado
module.exports = cloudinary;