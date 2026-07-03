import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireRole from '../middlewares/roleMiddleware.js';
import resourceAvailabilityController from '../controllers/resource-availability-controller.js';
import taskController from '../controllers/task-controller.js';

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/v1/tasks/{id}/availability:
 *   get:
 *     tags: [Tasks]
 *     summary: Verificar disponibilidad de una tarea
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Disponibilidad de la tarea
 */
router.get(
  '/:id/availability',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  resourceAvailabilityController.checkTask
);
/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Actualizar tarea
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Tarea actualizada
 *               descripcion:
 *                 type: string
 *                 example: Descripción de la tarea
 *               estado:
 *                 type: string
 *                 example: en_progreso
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *       404:
 *         description: Tarea no encontrada
 */
router.put('/:id', requireRole('Gestor', 'Profesional'), taskController.updateTask);
/**
 * @openapi
 * /api/v1/tasks/{id}/assignee:
 *   patch:
 *     tags: [Tasks]
 *     summary: Asignar responsable a la tarea
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assigneeId]
 *             properties:
 *               assigneeId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Responsable asignado
 */
router.patch(
  '/:id/assignee',
  requireRole('Gestor', 'Profesional'),
  taskController.assignAssignee
);
/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Eliminar tarea
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Tarea eliminada
 *       404:
 *         description: Tarea no encontrada
 */
router.delete('/:id', requireRole('Gestor'), taskController.deleteTask);

export default router;