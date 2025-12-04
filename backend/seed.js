// Cargamos las variables de entorno
require('dotenv').config();

// Importamos dependencias
const mongoose = require('mongoose');
const User = require('./models/user');
const connectDB = require('./config/database');

/**
 * SCRIPT SEED
 * Crea el SuperAdmin inicial en la base de datos
 * Ejecutar con: npm run seed
 */

const crearSuperAdmin = async () => {
  try {
    console.log('🌱 Iniciando seed...');
    
    // 1. Conectar a la base de datos
    await connectDB();
    
    // 2. Verificar si ya existe un superadmin
    const superAdminExistente = await User.findOne({ rol: 'superadmin' });
    
    if (superAdminExistente) {
      console.log('⚠️  Ya existe un SuperAdmin en la base de datos:');
      console.log(`   Email: ${superAdminExistente.email}`);
      console.log('   No se creará uno nuevo.');
      process.exit(0);
    }
    
    // 3. Crear el SuperAdmin
    const superAdmin = new User({
      nombre: 'Super Administrador',
      email: 'superadmin@canchas.com',
      password: 'superadmin123', 
      rol: 'superadmin'
    });
    
    await superAdmin.save();
    
    console.log('✅ SuperAdmin creado exitosamente:');
    console.log('==========================================');
    console.log('   Email: superadmin@canchas.com');
    console.log('   Password: superadmin123');
    console.log('==========================================');
    
    // 4. Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error al crear SuperAdmin:', error);
    process.exit(1);
  }
};

// Ejecutar la función
crearSuperAdmin();