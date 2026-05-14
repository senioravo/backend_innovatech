const ProjectModel = require('../models/projectModel');
const IProjectRepository = require('../interfaces/IProjectRepository');
const { getPool } = require('../db/pool');

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
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
  });
}

class ProjectRepository extends IProjectRepository {
  async findByUserId(userId) {
    if (!userId) throw new Error('userId is required');
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT * FROM "PROJECT" WHERE owner_user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map(mapProjectRow);
  }

  async findByIdAndUserId(id, userId) {
    if (!id || !userId) throw new Error('id and userId are required');
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT * FROM "PROJECT" WHERE id = $1 AND owner_user_id = $2`,
      [id, userId]
    );
    return rows[0] ? mapProjectRow(rows[0]) : null;
  }

  async create(data) {
    if (!data || !data.userId) throw new Error('data and userId are required');
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO "PROJECT" (owner_user_id, name, description, responsable_id, fecha_inicio, fecha_termino)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.userId,
        data.name,
        data.description,
        data.assigneeId ?? null,
        data.startDate ?? null,
        data.endDate ?? null
      ]
    );
    return mapProjectRow(rows[0]);
  }

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

module.exports = new ProjectRepository();
