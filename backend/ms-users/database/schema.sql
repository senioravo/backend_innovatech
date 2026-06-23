-- Script de creación de tabla usuarios para ms-users
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
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema Innovatech (ms-users)';
COMMENT ON COLUMN usuarios.id IS 'Identificador único del usuario';
COMMENT ON COLUMN usuarios.nombre IS 'Nombre completo del usuario';
COMMENT ON COLUMN usuarios.email IS 'Email único del usuario';
COMMENT ON COLUMN usuarios.password IS 'Contraseña cifrada con bcrypt';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: gestor, profesional, directivo';
COMMENT ON COLUMN usuarios.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN usuarios.updated_at IS 'Fecha de última actualización';

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

-- Usuarios de ejemplo (opcional - comentar en producción)
-- INSERT INTO usuarios (nombre, email, password, rol) 
-- VALUES 
--   ('Gestor Test', 'gestor@innovatech.cl', '$2b$10$hash_ejemplo', 'gestor'),
--   ('Profesional Test', 'profesional@innovatech.cl', '$2b$10$hash_ejemplo', 'profesional'),
--   ('Directivo Test', 'directivo@innovatech.cl', '$2b$10$hash_ejemplo', 'directivo');
