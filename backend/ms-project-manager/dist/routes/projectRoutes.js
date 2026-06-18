// @ts-nocheck
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireRole from '../middlewares/roleMiddleware.js';
import projectController from '../controllers/project-controller.js';
import resourceAvailabilityController from '../controllers/resource-availability-controller.js';
import taskController from '../controllers/task-controller.js';
const router = express.Router();
router.use(authMiddleware);
/**
 * @openapi
 * /api/v1/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Listar proyectos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
router.get('/', requireRole('Gestor', 'Profesional', 'Directivo'), projectController.listProjects);
/**
 * @openapi
 * /api/v1/projects/{projectId}/tasks/{taskId}/availability:
 *   get:
 *     tags: [Projects]
 *     summary: Verificar disponibilidad de una tarea en un proyecto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Disponibilidad de la tarea
 */
router.get('/:projectId/tasks/:taskId/availability', requireRole('Gestor', 'Profesional', 'Directivo'), resourceAvailabilityController.checkTaskInProject);
/**
 * @openapi
 * /api/v1/projects/{projectId}/tasks/{taskId}:
 *   get:
 *     tags: [Projects]
 *     summary: Obtener tarea de un proyecto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *       404:
 *         description: Tarea no encontrada
 */
router.get('/:projectId/tasks/:taskId', requireRole('Gestor', 'Profesional', 'Directivo'), taskController.getTask);
/**
 * @openapi
 * /api/v1/projects/{projectId}/tasks/{taskId}/status:
 *   patch:
 *     tags: [Projects]
 *     summary: Cambiar estado de una tarea
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 example: completada
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:projectId/tasks/:taskId/status', requireRole('Gestor', 'Profesional', 'Directivo'), taskController.patchTaskStatus);
/**
 * @openapi
 * /api/v1/projects/{projectId}/tasks:
 *   get:
 *     tags: [Projects]
 *     summary: Listar tareas de un proyecto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de tareas
 */
router.get('/:projectId/tasks', requireRole('Gestor', 'Profesional', 'Directivo'), taskController.listTasksForProject);
/**
 * @openapi
 * /api/v1/projects/{projectId}/tasks:
 *   post:
 *     tags: [Projects]
 *     summary: Crear tarea en un proyecto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Nueva tarea
 *               descripcion:
 *                 type: string
 *                 example: Descripción de la tarea
 *               assigneeId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Tarea creada
 */
router.post('/:projectId/tasks', requireRole('Gestor', 'Profesional'), taskController.createTask);
/**
 * @openapi
 * /api/v1/projects/{id}/availability:
 *   get:
 *     tags: [Projects]
 *     summary: Verificar disponibilidad de un proyecto
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
 *         description: Disponibilidad del proyecto
 */
router.get('/:id/availability', requireRole('Gestor', 'Profesional', 'Directivo'), resourceAvailabilityController.checkProject);
/**
 * @openapi
 * /api/v1/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Obtener proyecto por ID
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
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 */
router.get('/:id', requireRole('Gestor', 'Profesional', 'Directivo'), projectController.getProject);
/**
 * @openapi
 * /api/v1/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Crear proyecto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Proyecto Alpha
 *               descripcion:
 *                 type: string
 *                 example: Descripción del proyecto
 *     responses:
 *       201:
 *         description: Proyecto creado
 */
router.post('/', requireRole('Gestor'), projectController.createProject);
/**
 * @openapi
 * /api/v1/projects/{id}:
 *   put:
 *     tags: [Projects]
 *     summary: Actualizar proyecto
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
 *                 example: Proyecto actualizado
 *               descripcion:
 *                 type: string
 *                 example: Nueva descripción
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 */
router.put('/:id', requireRole('Gestor', 'Profesional'), projectController.updateProject);
/**
 * @openapi
 * /api/v1/projects/{id}/assignee:
 *   patch:
 *     tags: [Projects]
 *     summary: Asignar responsable al proyecto
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
router.patch('/:id/assignee', requireRole('Gestor', 'Profesional'), projectController.assignAssignee);
/**
 * @openapi
 * /api/v1/projects/{id}/status:
 *   patch:
 *     tags: [Projects]
 *     summary: Cambiar estado del proyecto
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
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 example: activo
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:id/status', requireRole('Gestor', 'Profesional', 'Directivo'), projectController.patchProjectStatus);
/**
 * @openapi
 * /api/v1/projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Eliminar proyecto
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
 *         description: Proyecto eliminado
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete('/:id', requireRole('Gestor'), projectController.deleteProject);
export default router;
