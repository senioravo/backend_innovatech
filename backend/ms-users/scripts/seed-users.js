/**
 * Usuarios de demo con los 3 roles del sistema.
 * Password común de desarrollo: Secret123
 *
 * Uso local:
 *   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/innovatech_users?sslmode=disable node scripts/seed-users.js
 *
 * Docker:
 *   docker compose exec users node scripts/seed-users.js
 */
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const DEFAULT_PASSWORD = process.env.SEED_USER_PASSWORD || 'Secret123';

/** Roles alineados con ROLES_INFO en src/config/roles.ts */
const SEED_USERS = [
  {
    nombre: 'Gestor Test',
    email: 'gestor@innovatech.cl',
    rol: 'gestor',
    descripcion: 'Crea/edita proyectos y tareas; supervisa equipos'
  },
  {
    nombre: 'Profesional Test',
    email: 'profesional@innovatech.cl',
    rol: 'profesional',
    descripcion: 'Ve proyectos/tareas y actualiza su trabajo asignado'
  },
  {
    nombre: 'Directivo Test',
    email: 'directivo@innovatech.cl',
    rol: 'directivo',
    descripcion: 'Ve dashboard, KPIs y reportes (solo lectura ejecutiva)'
  }
];

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5433/innovatech_users?sslmode=disable';

const pool = new Pool({
  connectionString,
  ssl: /@(users-db|localhost|127\.0\.0\.1)/.test(connectionString) || /sslmode=disable/i.test(connectionString)
    ? false
    : { rejectUnauthorized: false }
});

async function seedUsers() {
  console.log('🌱 Sembrando usuarios de demo (gestor, profesional, directivo)...\n');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const user of SEED_USERS) {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         password = EXCLUDED.password,
         rol = EXCLUDED.rol,
         updated_at = NOW()
       RETURNING id, nombre, email, rol`,
      [user.nombre, user.email.toLowerCase(), hashedPassword, user.rol]
    );

    const row = result.rows[0];
    console.log(`✅ ${row.rol.padEnd(12)} | ${row.email.padEnd(28)} | ${user.descripcion}`);
  }

  console.log(`\n🔑 Password para todos: ${DEFAULT_PASSWORD}`);
  console.log('\nPermisos en la app (vía KrakenD/BFF/PM):');
  console.log('  • gestor      → crear proyectos, tareas, editar, ver todo');
  console.log('  • profesional → ver proyectos/tareas, editar tareas asignadas');
  console.log('  • directivo   → ver proyectos/tareas/dashboard (sin crear proyectos en UI)');
}

seedUsers()
  .then(async () => {
    await pool.end();
    console.log('\n✔ Seed completado');
  })
  .catch(async (err) => {
    console.error('❌ Error en seed:', err.message);
    await pool.end();
    process.exit(1);
  });
