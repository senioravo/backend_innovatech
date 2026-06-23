import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_AUTH;

if (!DATABASE_URL) {
  console.error('❌ Define DATABASE_URL o DATABASE_URL_AUTH en tu archivo .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

async function createTestUser() {
  console.log('🔄 Conectando a la base de datos...');

  try {
    const client = await pool.connect();
    console.log('✅ Conectado exitosamente');

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

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const result = await client.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol`,
      ['Administrador', 'admin@innovatech.com', hashedPassword, 'gestor']
    );

    console.log('✅ Usuario de prueba creado exitosamente');
    console.log('\n📝 Credenciales:');
    console.log('   Email: admin@innovatech.com');
    console.log('   Password: Admin123!');
    console.log('\n👤 Usuario:', result.rows[0]);

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
