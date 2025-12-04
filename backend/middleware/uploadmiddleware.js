// Importamos multer para manejar archivos
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

/**
 * MIDDLEWARE DE SUBIDA DE IMÁGENES
 * Usa multer + Cloudinary para subir imágenes
 */

// Configurar multer para usar memoria (no guardar en disco)
const storage = multer.memoryStorage();

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true); // Aceptar archivo
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, WEBP)'), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Máximo 5MB
  }
});

/**
 * Middleware para subir una imagen a Cloudinary
 * Agrega la URL de la imagen a req.imagenUrl
 */
const subirImagenCloudinary = async (req, res, next) => {
  try {
    // Si no hay archivo, continuar sin imagen
    if (!req.file) {
      return next();
    }
    
    // Convertir el buffer a base64
    const base64Image = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;
    
    // Subir a Cloudinary
    const resultado = await cloudinary.uploader.upload(dataUri, {
      folder: 'canchas', // Carpeta en Cloudinary
      transformation: [
        { width: 800, height: 600, crop: 'fill' }, // Redimensionar
        { quality: 'auto' } // Optimizar calidad
      ]
    });
    
    // Agregar URL a la request
    req.imagenUrl = resultado.secure_url;
    req.cloudinaryId = resultado.public_id; 
    
    next();
    
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    res.status(500).json({ 
      error: 'Error al subir la imagen.' 
    });
  }
};

// Exportar multer configurado y el middleware
module.exports = {
  upload: upload.single('imagen'), // Campo del formulario: 'imagen'
  subirImagenCloudinary
};