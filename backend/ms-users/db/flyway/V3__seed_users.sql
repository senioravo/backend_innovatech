-- Flyway V3: demo users (password: Secret123)
INSERT INTO usuarios (nombre, email, password, rol)
VALUES
  (
    'Gestor Test',
    'gestor@innovatech.cl',
    '$2b$10$MaEV32a3I.gkFh4nhFiGDeuoUFtQrPU61m.LAL1JDC5r1Rypj51AS',
    'gestor'
  ),
  (
    'Profesional Test',
    'profesional@innovatech.cl',
    '$2b$10$MaEV32a3I.gkFh4nhFiGDeuoUFtQrPU61m.LAL1JDC5r1Rypj51AS',
    'profesional'
  ),
  (
    'Directivo Test',
    'directivo@innovatech.cl',
    '$2b$10$MaEV32a3I.gkFh4nhFiGDeuoUFtQrPU61m.LAL1JDC5r1Rypj51AS',
    'directivo'
  )
ON CONFLICT (email) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  password = EXCLUDED.password,
  rol = EXCLUDED.rol,
  updated_at = CURRENT_TIMESTAMP;

UPDATE usuarios SET habilidades = 'gestión de proyectos, metodologías ágiles'
  WHERE email = 'gestor@innovatech.cl' AND (habilidades IS NULL OR habilidades = '');

UPDATE usuarios SET habilidades = 'desarrollo backend, node.js, postgresql', disponibilidad = 'disponible'
  WHERE email = 'profesional@innovatech.cl' AND (habilidades IS NULL OR habilidades = '');

UPDATE usuarios SET habilidades = 'análisis estratégico, KPIs, reportes ejecutivos', disponibilidad = 'disponible'
  WHERE email = 'directivo@innovatech.cl' AND (habilidades IS NULL OR habilidades = '');
