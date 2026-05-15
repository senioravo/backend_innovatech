-- ==========================================
-- Script de Inicialización para BD de Test
-- ==========================================
-- Copiar y pegar en Neon SQL Editor
-- Base de datos: innovatech_test
-- ==========================================

-- Eliminar tabla si existe (para reiniciar tests)
DROP TABLE IF EXISTS usuarios CASCADE;

-- Crear tabla de usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) CHECK (rol IN ('gestor', 'profesional', 'directivo')) DEFAULT 'profesional',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Verificar que la tabla fue creada
SELECT 
    'Tabla usuarios creada exitosamente' as status,
    COUNT(*) as total_usuarios
FROM usuarios;

-- Mostrar estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;
