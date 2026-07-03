import { getPool } from '../db/pool.js';

class CollaborationRepository {
  async listComments(taskId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, task_id, user_id, content, created_at
       FROM "TASK_COMMENT" WHERE task_id = $1 ORDER BY created_at ASC`,
      [taskId]
    );
    return rows;
  }

  async addComment(taskId, userId, content) {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO "TASK_COMMENT" (task_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, task_id, user_id, content, created_at`,
      [taskId, String(userId), content]
    );
    return rows[0];
  }

  async listAttachments(taskId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, task_id, user_id, document_name, document_url, created_at
       FROM "TASK_ATTACHMENT" WHERE task_id = $1 ORDER BY created_at DESC`,
      [taskId]
    );
    return rows;
  }

  async addAttachment(taskId, userId, documentName, documentUrl) {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO "TASK_ATTACHMENT" (task_id, user_id, document_name, document_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, task_id, user_id, document_name, document_url, created_at`,
      [taskId, String(userId), documentName, documentUrl]
    );
    return rows[0];
  }

  async listNotifications(userId, limit = 50) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, user_id, type, title, message, read, created_at
       FROM "NOTIFICATION"
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [String(userId), limit]
    );
    return rows;
  }

  async createNotification(userId, type, title, message) {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO "NOTIFICATION" (user_id, type, title, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, type, title, message, read, created_at`,
      [String(userId), type, title, message]
    );
    return rows[0];
  }

  async markNotificationRead(notificationId, userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `UPDATE "NOTIFICATION" SET read = true
       WHERE id = $1 AND user_id = $2
       RETURNING id, read`,
      [notificationId, String(userId)]
    );
    return rows[0] || null;
  }
}

export default new CollaborationRepository();
