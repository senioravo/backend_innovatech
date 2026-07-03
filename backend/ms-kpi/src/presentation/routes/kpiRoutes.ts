const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const kpiController = require('../controllers/kpiController');

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/v1/kpis/dashboard:
 *   get:
 *     tags: [KPIs]
 *     summary: Dashboard de progreso de tareas y proyectos
 *     description: |
 *       Agrega proyectos y tareas del usuario autenticado (via project-manager)
 *       y devuelve totales, conteo por estado, tasa de completitud y tareas recientes.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs agregados del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KpiDashboard'
 *       401:
 *         description: Token JWT ausente o invalido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Rol no autorizado (requiere Gestor, Profesional o Directivo)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: Error al consultar project-manager
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/dashboard',
  requireRole('Gestor', 'Profesional', 'Directivo'),
  kpiController.getDashboard
);

module.exports = router;
