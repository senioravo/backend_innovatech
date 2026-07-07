/**
 * Repositorio de persistencia de proyectos (PostgreSQL).
 * Mapea filas de la tabla PROJECT al modelo de dominio ProjectModel.
 */
import ProjectModel from '../models/projectModel.js';
import IProjectRepository from '../interfaces/IProjectRepository.js';
import { getPool } from '../db/pool.js';

/**
 * Convierte una fila SQL en instancia de ProjectModel.
 * @param {object|null} row - Fila de la tabla PROJECT
 * @returns {ProjectModel|null} Modelo de dominio o null
 */
function mapProjectRow(row) {
  if (!row) return null;
  return new ProjectModel({
    id: String(row.id),
    userId: row.owner_user_id,
    name: row.name,
    description: row.description,
    assigneeId: row.responsable_id,
    startDate: row.fecha_inicio,
    endDate: row.fecha_termino,
    status: row.status ?? 'active',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
  });
}

class ProjectRepository extends IProjectRepository {
  /**
   * Lista proyectos propiedad de un usuario.
   * @param {string|number} userId - ID del propietario
   * @returns {Promise<ProjectModel[]>} Proyectos del usuario
   */
  async findByUserId(userId) {
    if (!userId) throw new Error('userId is required');
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT * FROM "PROJECT" WHERE owner_user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map(mapProjectRow);
  }

  /**
   * Lista todos los proyectos (vista administrativa).
   * @returns {Promise<ProjectModel[]>} Todos los proyectos
   */
  async findAll() {
    const pool = getPool();
    const { rows } = await pool.query(`SELECT * FROM "PROJECT" ORDER BY created_at DESC`);
    return rows.map(mapProjectRow);
  }

  /**
   * Busca proyecto por ID restringido al propietario.
   * @param {string|number} id - ID del proyecto
   * @param {string|number} userId - ID del propietario
   * @returns {Promise<ProjectModel|null>} Proyecto o null
   */
  async findByIdAndUserId(id, userId) {
    if (!id || !userId) throw new Error('id and userId are required');
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT * FROM "PROJECT" WHERE id = $1 AND owner_user_id = $2`,
      [id, userId]
    );
    return rows[0] ? mapProjectRow(rows[0]) : null;
  }

  /**
   * Busca proyecto por ID sin restricción de propietario.
   * @param {string|number} id - ID del proyecto
   * @returns {Promise<ProjectModel|null>} Proyecto o null
   */
  async findById(id) {
    if (!id) throw new Error('id is required');
    const pool = getPool();
    const { rows } = await pool.query(`SELECT * FROM "PROJECT" WHERE id = $1`, [id]);
    return rows[0] ? mapProjectRow(rows[0]) : null;
  }

  /**
   * Inserta un nuevo proyecto.
   * @param {object} data - Datos del proyecto (userId, name, description, assigneeId, fechas)
   * @returns {Promise<ProjectModel>} Proyecto creado
   */
  async create(data) {
    if (!data || !data.userId) throw new Error('data and userId are required');
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO "PROJECT" (owner_user_id, name, description, responsable_id, fecha_inicio, fecha_termino)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        String(data.userId),
        data.name,
        data.description,
        data.assigneeId ?? null,
        data.startDate ?? null,
        data.endDate ?? null
      ]
    );
    return mapProjectRow(rows[0]);
  }

  /**
   * Actualiza campos parciales de un proyecto del propietario.
   * @param {string|number} id - ID del proyecto
   * @param {string|number} userId - ID del propietario
   * @param {object} patch - Campos a actualizar
   * @returns {Promise<ProjectModel|null>} Proyecto actualizado o null
   */
  async update(id, userId, patch) {
    if (!id || !userId) throw new Error('id and userId are required');
    const sets = [];
    const vals = [id, userId];
    let n = 3;
    if (patch.name !== undefined) {
      sets.push(`name = $${n}`);
      vals.push(patch.name);
      n += 1;
    }
    if (patch.description !== undefined) {
      sets.push(`description = $${n}`);
      vals.push(patch.description);
      n += 1;
    }
    if (patch.assigneeId !== undefined) {
      sets.push(`responsable_id = $${n}`);
      vals.push(patch.assigneeId);
      n += 1;
    }
    if (patch.startDate !== undefined) {
      sets.push(`fecha_inicio = $${n}`);
      vals.push(patch.startDate);
      n += 1;
    }
    if (patch.endDate !== undefined) {
      sets.push(`fecha_termino = $${n}`);
      vals.push(patch.endDate);
      n += 1;
    }
    if (sets.length === 0) {
      return this.findByIdAndUserId(id, userId);
    }
    sets.push('updated_at = now()');
    const pool = getPool();
    const sql = `UPDATE "PROJECT" SET ${sets.join(', ')} WHERE id = $1 AND owner_user_id = $2 RETURNING *`;
    const { rows } = await pool.query(sql, vals);
    return rows[0] ? mapProjectRow(rows[0]) : null;
  }

  /**
   * Actualiza estado del proyecto solo si el usuario es el responsable asignado.
   * @param {string|number} id - ID del proyecto
   * @param {string|number} assigneeId - ID del responsable
   * @param {string} status - Nuevo estado
   * @returns {Promise<ProjectModel|null>} Proyecto actualizado o null
   */
  async updateStatusByAssignee(id, assigneeId, status) {
    if (!id || !assigneeId || !status) {
      throw new Error('id, assigneeId and status are required');
    }
    const pool = getPool();
    const { rows } = await pool.query(
      `UPDATE "PROJECT" SET status = $3, updated_at = now()
       WHERE id = $1 AND responsable_id = $2
       RETURNING *`,
      [id, assigneeId, status]
    );
    return rows[0] ? mapProjectRow(rows[0]) : null;
  }

  /**
   * Elimina un proyecto del propietario.
   * @param {string|number} id - ID del proyecto
   * @param {string|number} userId - ID del propietario
   * @returns {Promise<boolean>} true si se eliminó al menos una fila
   */
  async delete(id, userId) {
    if (!id || !userId) throw new Error('id and userId are required');
    const pool = getPool();
    const { rowCount } = await pool.query(
      `DELETE FROM "PROJECT" WHERE id = $1 AND owner_user_id = $2`,
      [id, userId]
    );
    return rowCount > 0;
  }
}

export default new ProjectRepository();
