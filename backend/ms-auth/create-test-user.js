// Script para crear un usuario de prueba
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const DATABASE_URL = 'postgresql://neondb_owner:npg_mUZLr81Eslyx@ep-super-tooth-ata043sj-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTestUser() {
  console.log('🔄 Conectando a Neon Cloud...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Conectado exitosamente');
    
    // Verificar si ya existe el usuario
    const checkUser = await client.query('SELECT email FROM usuarios WHERE email = $1', ['admin@innovatech.com']);
    
    if (checkUser.rows.length > 0) {
      console.log('⚠️  El usuario admin@innovatech.com ya existe');
      console.log('\n📝 Credenciales:');
      console.log('   Email: admin@innovatech.com');
      console.log('   Password: Admin123!');
      client.release();
      await pool.end();
      return;
    }
    
    // Crear hash de la contraseña
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insertar usuario de prueba
    await client.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
      ['Administrador', 'admin@innovatech.com', hashedPassword, 'directivo']
    );
    
    console.log('✅ Usuario de prueba creado exitosamente');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Email: admin@innovatech.com');
    console.log('   Password: Admin123!');
    console.log('   Rol: directivo\n');
    
    // Crear usuarios adicionales
    const usuarios = [
      { nombre: 'Gestor Test', email: 'gestor@innovatech.com', password: 'Gestor123!', rol: 'gestor' },
      { nombre: 'Profesional Test', email: 'profesional@innovatech.com', password: 'Prof123!', rol: 'profesional' }
    ];
    
    for (const usuario of usuarios) {
      const hash = await bcrypt.hash(usuario.password, 10);
      await client.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
        [usuario.nombre, usuario.email, hash, usuario.rol]
      );
      console.log(`✅ Usuario ${usuario.email} creado (${usuario.rol})`);
    }
    
    console.log('\n📊 Total de usuarios creados: 3');
    console.log('🚀 Ya puedes iniciar sesión en el frontend\n');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
