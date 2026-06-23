-- Flyway V2: professional profile columns
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS habilidades TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS disponibilidad VARCHAR(20) DEFAULT 'disponible',
  ADD COLUMN IF NOT EXISTS horas_semanales_disponibles INT DEFAULT 40;

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS chk_disponibilidad;
ALTER TABLE usuarios ADD CONSTRAINT chk_disponibilidad
  CHECK (disponibilidad IN ('disponible', 'ocupado', 'parcial'));
