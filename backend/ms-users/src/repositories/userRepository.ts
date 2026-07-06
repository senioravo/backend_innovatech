/**
 * Capa de persistencia PostgreSQL para la tabla `usuarios`.
 * Mapea filas SQL a objetos de dominio vía userRowMapper.
 */
import { query } from '../config/database.js';
import { mapUserRow, mapUserRows } from '../utils/userRowMapper.js';
import { getAllRoles } from '../config/roles.js';
const VALID_ROLES = getAllRoles();

class UserRepository {
  /**
   * Verifica si un email ya está registrado.
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async emailExists(email: string) {
    const result = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows.length > 0;
  }

  /**
   * Inserta un usuario nuevo (password ya hasheado).
   * @param {{ name: string; email: string; passwordHash: string; role: string }} data
   * @returns {Promise<object>}
   */
  async create(data: { name: string; email: string; passwordHash: string; role: string }) {
    const result = await query(
      `INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, nombre, email, rol, created_at, updated_at`,
      [data.name, data.email.toLowerCase(), data.passwordHash, data.role]
    );
    return mapUserRow(result.rows[0]);
  }

  /** @param {number} id @returns {Promise<object|null>} */
  async findById(id: number) {
    const result = await query(
      `SELECT id, nombre, email, rol, habilidades, disponibilidad,
              horas_semanales_disponibles, created_at, updated_at
       FROM usuarios WHERE id = $1`,
      [id]
    );
    return result.rows.length > 0 ? mapUserRow(result.rows[0]) : null;
  }

  /** @param {string} email @returns {Promise<object|null>} Sin campo password */
  async findByEmail(email: string) {
    const result = await query(
      'SELECT id, nombre, email, rol, created_at, updated_at FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows.length > 0 ? mapUserRow(result.rows[0]) : null;
  }

  /** @param {string} email @returns {Promise<object|null>} Incluye password para login interno */
  async findByEmailWithPassword(email: string) {
    const result = await query(
      'SELECT id, nombre, email, password, rol, created_at, updated_at FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows.length > 0 ? mapUserRow(result.rows[0]) : null;
  }

  /**
   * Lista paginada con filtros opcionales por rol y búsqueda textual.
   * @param {{ page?: number; limit?: number; role?: string|null; search?: string|null }} options
   * @returns {Promise<{ users: object[]; pagination: object }>}
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    role?: string | null;
    search?: string | null;
  } = {}) {
    const { page = 1, limit = 10, role = null, search = null } = options;    const offset = (Number(page) - 1) * Number(limit);
    let queryText = `SELECT id, nombre, email, rol, habilidades, disponibilidad,
                            horas_semanales_disponibles, created_at, updated_at
                     FROM usuarios`;
    let countQueryText = 'SELECT COUNT(*) FROM usuarios';
    const params: unknown[] = [];
    const whereClauses: string[] = [];

    if (role && VALID_ROLES.includes(role)) {
      whereClauses.push(`rol = $${params.length + 1}`);
      params.push(role);
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
      users: mapUserRows(usersResult.rows),
      pagination: { total, page, limit, totalPages }
    };
  }

  /**
   * Actualiza campos dinámicos del usuario (nombre, email, password, rol).
   * @param {number} id
   * @param {Record<string, unknown>} fields
   * @returns {Promise<object|null>}
   */
  async update(id: number, fields: Record<string, unknown>) {
    const dbFields: Record<string, unknown> = {};
    if (fields.name !== undefined) dbFields.nombre = fields.name;
    if (fields.nombre !== undefined) dbFields.nombre = fields.nombre;
    if (fields.email !== undefined) dbFields.email = fields.email;
    if (fields.password !== undefined) dbFields.password = fields.password;
    if (fields.role !== undefined) dbFields.rol = fields.role;
    if (fields.rol !== undefined) dbFields.rol = fields.rol;

    const updateFields: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(dbFields)) {
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
    return result.rows.length > 0 ? mapUserRow(result.rows[0]) : null;
  }

  /** @param {number} id @returns {Promise<boolean>} true si se eliminó una fila */
  async delete(id: number) {
    const result = await query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows.length > 0;
  }

  /** @param {number} id @param {string} newRole @returns {Promise<object|null>} */
  async updateRole(id: number, newRole: string) {
    const result = await query(
      `UPDATE usuarios
       SET rol = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, nombre, email, rol, habilidades, disponibilidad,
                 horas_semanales_disponibles, created_at, updated_at`,
      [newRole, id]
    );
    return result.rows.length > 0 ? mapUserRow(result.rows[0]) : null;
  }

  /** @returns {Promise<object[]>} Usuarios con rol profesional o gestor */
  async findProfessionals() {
    const result = await query(
      `SELECT id, nombre, email, rol, habilidades, disponibilidad,
              horas_semanales_disponibles
       FROM usuarios
       WHERE rol IN ('profesional', 'gestor')
       ORDER BY nombre ASC`
    );
    return mapUserRows(result.rows);
  }
  /**
   * Actualiza campos de perfil profesional (habilidades, disponibilidad, horas).
   * @param {number} id
   * @param {Record<string, unknown>} profile
   * @returns {Promise<object|null>}
   */
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
    return result.rows.length > 0 ? mapUserRow(result.rows[0]) : null;
  }
}

export default new UserRepository();