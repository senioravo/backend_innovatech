import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_AUTH;

if (!connectionString) {
  console.error('❌ Define DATABASE_URL o DATABASE_URL_AUTH en tu archivo .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

async function init() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    const client = await pool.connect();

    console.log('✅ Conectado exitosamente');

    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL CHECK (rol IN ('gestor', 'profesional', 'directivo')) DEFAULT 'profesional',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla usuarios creada');

    await client.query('CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol)');
    console.log('✅ Índices de usuarios creados');

    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        fecha_inicio DATE,
        fecha_fin DATE,
        estado VARCHAR(50) DEFAULT 'planificacion',
        assignee_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla projects creada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        assignee_id INTEGER,
        estado VARCHAR(50) DEFAULT 'pendiente',
        prioridad VARCHAR(50) DEFAULT 'media',
        fecha_limite DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla tasks creada');

    await client.query('CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_projects_assignee_id ON projects(assignee_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id)');
    console.log('✅ Índices de projects/tasks creados');

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📊 Tablas en la base de datos:');
    result.rows.forEach((row) => console.log('  ✓', row.table_name));

    client.release();
    await pool.end();

    console.log('\n✅ Base de datos inicializada correctamente\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

init();
