-- Perfil profesional: habilidades y disponibilidad (recursos humanos)

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS habilidades TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS disponibilidad VARCHAR(20) DEFAULT 'disponible',
  ADD COLUMN IF NOT EXISTS horas_semanales_disponibles INT DEFAULT 40;

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS chk_disponibilidad;
ALTER TABLE usuarios ADD CONSTRAINT chk_disponibilidad
  CHECK (disponibilidad IN ('disponible', 'ocupado', 'parcial'));

UPDATE usuarios SET habilidades = 'gestión de proyectos, metodologías ágiles'
  WHERE email = 'gestor@innovatech.cl' AND (habilidades IS NULL OR habilidades = '');

UPDATE usuarios SET habilidades = 'desarrollo backend, node.js, postgresql', disponibilidad = 'disponible'
  WHERE email = 'profesional@innovatech.cl' AND (habilidades IS NULL OR habilidades = '');

UPDATE usuarios SET habilidades = 'análisis estratégico, KPIs, reportes ejecutivos', disponibilidad = 'disponible'
  WHERE email = 'directivo@innovatech.cl' AND (habilidades IS NULL OR habilidades = '');
