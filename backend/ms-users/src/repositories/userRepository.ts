import { query } from '../config/database.js';
import logger from '../utils/logger.js';
import { getAllRoles } from '../config/roles.js';

const VALID_ROLES = getAllRoles();

class UserRepository {
  async emailExists(email: string) {
    const result = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows.length > 0;
  }

  async create(data: { nombre: string; email: string; passwordHash: string; rol: string }) {
    const result = await query(
      `INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, nombre, email, rol, created_at, updated_at`,
      [data.nombre, data.email.toLowerCase(), data.passwordHash, data.rol]
    );
    return result.rows[0];
  }

  async findById(id: number) {
    const result = await query(
      `SELECT id, nombre, email, rol, habilidades, disponibilidad,
              horas_semanales_disponibles, created_at, updated_at
       FROM usuarios WHERE id = $1`,
      [id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByEmail(email: string) {
    const result = await query(
      'SELECT id, nombre, email, rol, created_at, updated_at FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByEmailWithPassword(email: string) {
    const result = await query(
      'SELECT id, nombre, email, password, rol, created_at, updated_at FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    rol?: string | null;
    search?: string | null;
  } = {}) {
    const { page = 1, limit = 10, rol = null, search = null } = options;
    const offset = (Number(page) - 1) * Number(limit);
    let queryText = `SELECT id, nombre, email, rol, habilidades, disponibilidad,
                            horas_semanales_disponibles, created_at, updated_at
                     FROM usuarios`;
    let countQueryText = 'SELECT COUNT(*) FROM usuarios';
    const params: unknown[] = [];
    const whereClauses: string[] = [];

    if (rol && VALID_ROLES.includes(rol)) {
      whereClauses.push(`rol = $${params.length + 1}`);
      params.push(rol);
    }

    if (search) {
      whereClauses.push(`(nombre ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (whereClauses.length > 0) {
      const whereString = ' WHERE ' + whereClauses.join(' AND ');
      queryText += whereString;
      countQueryText += whereString;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const queryParams = [...params, limit, offset];

    const [usersResult, countResult] = await Promise.all([
      query(queryText, queryParams),
      query(countQueryText, params)
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / Number(limit));

    return {
      users: usersResult.rows,
      pagination: { total, page, limit, totalPages }
    };
  }

  async update(id: number, fields: Record<string, unknown>) {
    const updateFields: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(fields)) {
      updateFields.push(`${key} = $${paramIndex++}`);
      params.push(value);
    }

    updateFields.push('updated_at = NOW()');
    params.push(id);

    const queryText = `
      UPDATE usuarios
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, nombre, email, rol, created_at, updated_at
    `;

    const result = await query(queryText, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: number) {
    const result = await query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows.length > 0;
  }

  async updateRole(id: number, newRol: string) {
    const result = await query(
      `UPDATE usuarios
       SET rol = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, nombre, email, rol, habilidades, disponibilidad,
                 horas_semanales_disponibles, created_at, updated_at`,
      [newRol, id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findProfessionals() {
    const result = await query(
      `SELECT id, nombre, email, rol, habilidades, disponibilidad,
              horas_semanales_disponibles
       FROM usuarios
       WHERE rol IN ('profesional', 'gestor')
       ORDER BY nombre ASC`
    );
    return result.rows;
  }

  async updateProfile(id: number, profile: Record<string, unknown>) {
    const fields: string[] = [];
    const params: unknown[] = [];
    let n = 1;

    if (profile.habilidades !== undefined) {
      fields.push(`habilidades = $${n++}`);
      params.push(profile.habilidades);
    }
    if (profile.disponibilidad !== undefined) {
      fields.push(`disponibilidad = $${n++}`);
      params.push(profile.disponibilidad);
    }
    if (profile.horas_semanales_disponibles !== undefined) {
      fields.push(`horas_semanales_disponibles = $${n++}`);
      params.push(profile.horas_semanales_disponibles);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = NOW()');
    params.push(id);

    const result = await query(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${n}
       RETURNING id, nombre, email, rol, habilidades, disponibilidad,
                 horas_semanales_disponibles, created_at, updated_at`,
      params
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

export default new UserRepository();
