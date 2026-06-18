// @ts-nocheck
import TaskModel from '../models/taskModel.js';
import projectRepository from './projectRepository.js';
import { getPool } from '../db/pool.js';
function mapTaskRow(row) {
    if (!row)
        return null;
    return new TaskModel({
        id: String(row.id),
        projectId: String(row.project_id),
        title: row.title,
        description: row.description ?? '',
        completed: Boolean(row.completed),
        status: row.status ?? 'PENDING',
        assigneeId: row.responsable_id,
        startDate: row.fecha_inicio,
        endDate: row.fecha_termino,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
    });
}
class TaskRepository {
    async findByIdAndUserId(taskId, userId) {
        if (!taskId || !userId)
            throw new Error('taskId and userId are required');
        const pool = getPool();
        const { rows } = await pool.query(`SELECT t.* FROM "TASK" t
       INNER JOIN "PROJECT" p ON t.project_id = p.id
       WHERE t.id = $1 AND p.owner_user_id = $2`, [taskId, userId]);
        return rows[0] ? mapTaskRow(rows[0]) : null;
    }
    async findByProjectIdAndTaskId(projectId, taskId, userId) {
        if (!projectId || !taskId || !userId) {
            throw new Error('projectId, taskId and userId are required');
        }
        const project = await projectRepository.findByIdAndUserId(projectId, userId);
        if (!project)
            return null;
        const pool = getPool();
        const { rows } = await pool.query(`SELECT * FROM "TASK" WHERE id = $1 AND project_id = $2`, [taskId, projectId]);
        return rows[0] ? mapTaskRow(rows[0]) : null;
    }
    async findByProjectId(projectId) {
        if (!projectId)
            throw new Error('projectId is required');
        const pool = getPool();
        const { rows } = await pool.query(`SELECT * FROM "TASK" WHERE project_id = $1 ORDER BY created_at ASC`, [projectId]);
        return rows.map(mapTaskRow);
    }
    /**
     * Tareas donde el usuario es dueño del proyecto o responsable de la tarea.
     */
    async findForUserDashboard(userId) {
        if (!userId)
            throw new Error('userId is required');
        const pool = getPool();
        const { rows } = await pool.query(`SELECT t.*, p.name AS project_name
       FROM "TASK" t
       INNER JOIN "PROJECT" p ON t.project_id = p.id
       WHERE p.owner_user_id = $1 OR t.responsable_id = $1
       ORDER BY t.updated_at DESC NULLS LAST, t.created_at DESC`, [userId]);
        return rows.map((row) => ({
            task: mapTaskRow(row),
            projectName: row.project_name
        }));
    }
    async create(data) {
        if (!data?.projectId || !data?.title) {
            throw new Error('projectId and title are required');
        }
        const pool = getPool();
        const completed = Boolean(data.completed);
        const status = data.status ?? (completed ? 'DONE' : 'PENDING');
        const { rows } = await pool.query(`INSERT INTO "TASK" (project_id, title, description, completed, status, responsable_id, fecha_inicio, fecha_termino)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`, [
            data.projectId,
            data.title,
            data.description ?? '',
            completed,
            status,
            data.assigneeId ?? null,
            data.startDate ?? null,
            data.endDate ?? null
        ]);
        return mapTaskRow(rows[0]);
    }
    async update(taskId, userId, updates) {
        const sets = [];
        const vals = [taskId, userId];
        let n = 3;
        if (updates.title !== undefined) {
            sets.push(`title = $${n}`);
            vals.push(updates.title);
            n += 1;
        }
        if (updates.description !== undefined) {
            sets.push(`description = $${n}`);
            vals.push(updates.description);
            n += 1;
        }
        if (updates.completed !== undefined) {
            sets.push(`completed = $${n}`);
            vals.push(updates.completed);
            n += 1;
        }
        if (updates.status !== undefined) {
            sets.push(`status = $${n}`);
            vals.push(updates.status);
            n += 1;
        }
        if (updates.assigneeId !== undefined) {
            sets.push(`responsable_id = $${n}`);
            vals.push(updates.assigneeId);
            n += 1;
        }
        if (updates.startDate !== undefined) {
            sets.push(`fecha_inicio = $${n}`);
            vals.push(updates.startDate);
            n += 1;
        }
        if (updates.endDate !== undefined) {
            sets.push(`fecha_termino = $${n}`);
            vals.push(updates.endDate);
            n += 1;
        }
        if (sets.length === 0) {
            return this.findByIdAndUserId(taskId, userId);
        }
        sets.push('updated_at = now()');
        const pool = getPool();
        const sql = `UPDATE "TASK" t SET ${sets.join(', ')}
      FROM "PROJECT" p
      WHERE t.id = $1 AND t.project_id = p.id AND p.owner_user_id = $2
      RETURNING t.*`;
        const { rows } = await pool.query(sql, vals);
        return rows[0] ? mapTaskRow(rows[0]) : null;
    }
    async delete(taskId, userId) {
        const task = await this.findByIdAndUserId(taskId, userId);
        if (!task)
            return false;
        const pool = getPool();
        const { rowCount } = await pool.query(`DELETE FROM "TASK" t USING "PROJECT" p
       WHERE t.id = $1 AND t.project_id = p.id AND p.owner_user_id = $2`, [taskId, userId]);
        return rowCount > 0;
    }
    async deleteByProjectId(projectId) {
        if (!projectId)
            return;
        const pool = getPool();
        await pool.query(`DELETE FROM "TASK" WHERE project_id = $1`, [projectId]);
    }
}
export default new TaskRepository();
;
