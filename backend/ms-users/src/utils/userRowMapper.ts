/**
 * Maps PostgreSQL row columns (Spanish DB names) to English domain properties.
 */
function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.nombre,
    email: row.email,
    role: row.rol,
    password: row.password,
    skills: row.habilidades ?? '',
    availability: row.disponibilidad ?? 'disponible',
    weeklyAvailableHours: row.horas_semanales_disponibles ?? 40,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt
  };
}

function mapUserRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(mapUserRow);
}

function pickName(body = {}) {
  return body.name ?? body.nombre ?? null;
}

function pickRole(body = {}) {
  return body.role ?? body.rol ?? null;
}

export { mapUserRow, mapUserRows, pickName, pickRole };
