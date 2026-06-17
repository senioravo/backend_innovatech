import dotenv from 'dotenv';
// Script para inicializar las tablas en la base de datos de Neon
import { Pool } from 'pg';
dotenv.config();
// Conexión a Neon Cloud
const DATABASE_URL = 'postgresql://neondb_owner:npg_mUZLr81Eslyx@ep-super-tooth-ata043sj-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const schemaSQL = `
-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('gestor', 'profesional', 'directivo')) DEFAULT 'profesional',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice en email para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Crear índice en rol para filtros
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Crear tabla para project-manager (projects)
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

-- Crear tabla para project-manager (tasks)
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

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_assignee_id ON projects(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
`;

async function initializeDatabase() {
  console.log('🔄 Iniciando conexión a Neon Cloud...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a la base de datos');
    
    console.log('🔄 Ejecutando scripts de creación de tablas...');
    await client.query(schemaSQL);
    console.log('✅ Tablas creadas exitosamente');
    
    // Verificar tablas creadas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Tablas en la base de datos:');
    result.rows.forEach(row => {
      console.log('  ✓', row.table_name);
    });
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Base de datos inicializada correctamente');
    console.log('🚀 Ahora puedes iniciar los microservicios\n');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

initializeDatabase();
