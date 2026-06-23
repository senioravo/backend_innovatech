import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env.docker') });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_AUTH;

if (!DATABASE_URL) {
  console.error('❌ Define DATABASE_URL o DATABASE_URL_AUTH en .env / .env.docker');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

const schemaSQL = `
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('gestor', 'profesional', 'directivo')) DEFAULT 'profesional',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
);

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
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_assignee_id ON projects(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
`;

async function initializeDatabase() {
  console.log('🔄 Iniciando conexión a la base de datos...');

  try {
    const client = await pool.connect();
    console.log('✅ Conectado a la base de datos');

    await client.query(schemaSQL);
    console.log('✅ Tablas creadas exitosamente');

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📊 Tablas en la base de datos:');
    result.rows.forEach((row) => console.log('  ✓', row.table_name));

    client.release();
    await pool.end();

    console.log('\n✅ Base de datos inicializada correctamente\n');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
