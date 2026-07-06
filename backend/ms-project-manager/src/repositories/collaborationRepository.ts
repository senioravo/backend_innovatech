/**
 * Repositorio de colaboración (PostgreSQL).
 * Persiste comentarios, adjuntos y notificaciones asociados a tareas y usuarios.
 */
import { getPool } from '../db/pool.js';

class CollaborationRepository {
  /**
   * Lista comentarios de una tarea ordenados por fecha de creación.
   * @param {string|number} taskId - ID de la tarea
   * @returns {Promise<object[]>} Filas de TASK_COMMENT
   */
  async listComments(taskId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, task_id, user_id, content, created_at
       FROM "TASK_COMMENT" WHERE task_id = $1 ORDER BY created_at ASC`,
      [taskId]
    );
    return rows;
  }

  /**
   * Inserta un comentario en una tarea.
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del autor
   * @param {string} content - Texto del comentario
   * @returns {Promise<object>} Fila insertada
   */
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

  /**
   * Lista adjuntos de una tarea.
   * @param {string|number} taskId - ID de la tarea
   * @returns {Promise<object[]>} Filas de TASK_ATTACHMENT
   */
  async listAttachments(taskId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, task_id, user_id, document_name, document_url, created_at
       FROM "TASK_ATTACHMENT" WHERE task_id = $1 ORDER BY created_at DESC`,
      [taskId]
    );
    return rows;
  }

  /**
   * Registra un adjunto en una tarea.
   * @param {string|number} taskId - ID de la tarea
   * @param {string|number} userId - ID del autor
   * @param {string} documentName - Nombre del documento
   * @param {string} documentUrl - URL del documento
   * @returns {Promise<object>} Fila insertada
   */
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

  /**
   * Lista notificaciones de un usuario con límite configurable.
   * @param {string|number} userId - ID del destinatario
   * @param {number} [limit=50] - Cantidad máxima de filas
   * @returns {Promise<object[]>} Filas de NOTIFICATION
   */
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

  /**
   * Crea una notificación para un usuario.
   * @param {string|number} userId - ID del destinatario
   * @param {string} type - Tipo de notificación
   * @param {string} title - Título
   * @param {string} message - Mensaje
   * @returns {Promise<object>} Fila insertada
   */
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

  /**
   * Marca una notificación como leída si pertenece al usuario.
   * @param {string|number} notificationId - ID de la notificación
   * @param {string|number} userId - ID del destinatario
   * @returns {Promise<object|null>} Fila actualizada o null
   */
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
