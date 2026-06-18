-- Usuarios demo (3 roles). Password: Secret123
-- Hash bcrypt generado con cost 10.
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
