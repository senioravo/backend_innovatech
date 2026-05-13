-- AS-TASK-04: Script de creación de tabla usuarios
-- AS-TASK-17: Actualización de roles para coincidir con configuración del código
-- PostgreSQL Database Schema

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

-- Comentarios en la tabla
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema Innovatech';
COMMENT ON COLUMN usuarios.id IS 'Identificador único del usuario';
COMMENT ON COLUMN usuarios.nombre IS 'Nombre completo del usuario';
COMMENT ON COLUMN usuarios.email IS 'Email único del usuario (usado para login)';
COMMENT ON COLUMN usuarios.password IS 'Contraseña cifrada con bcrypt (AS-TASK-17)';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: gestor (gestiona proyectos), profesional (ejecuta tareas), directivo (ve KPIs)';
COMMENT ON COLUMN usuarios.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN usuarios.updated_at IS 'Fecha de última actualización';

-- Datos de ejemplo para testing (opcional - comentar en producción)
-- INSERT INTO usuarios (nombre, email, password, rol) 
-- VALUES 
--   ('Gestor Test', 'gestor@innovatech.cl', '$2b$10$hash_ejemplo', 'gestor'),
--   ('Profesional Test', 'profesional@innovatech.cl', '$2b$10$hash_ejemplo', 'profesional'),
--   ('Directivo Test', 'directivo@innovatech.cl', '$2b$10$hash_ejemplo', 'directivo');
