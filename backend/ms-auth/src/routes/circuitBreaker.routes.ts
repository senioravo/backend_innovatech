// @ts-nocheck
export {};
// AS-TASK-03: Rutas para pruebas de Circuit Breaker
const express = require('express');
const router = express.Router();
const circuitBreakerController = require('../controllers/circuitBreaker.controller');

/**
 * @openapi
 * /api/circuit-breaker/test/auth:
 *   get:
 *     tags: [CircuitBreaker]
 *     summary: Probar circuit breaker de Auth
 *     responses:
 *       200:
 *         description: Estado del circuit breaker
 * /api/circuit-breaker/test/project:
 *   get:
 *     tags: [CircuitBreaker]
 *     summary: Probar circuit breaker de Project Manager
 *     responses:
 *       200:
 *         description: Estado del circuit breaker
 * /api/circuit-breaker/stats:
 *   get:
 *     tags: [CircuitBreaker]
 *     summary: Estadísticas de los circuit breakers
 *     responses:
 *       200:
 *         description: Estadísticas
 */
router.get('/test/auth', circuitBreakerController.testAuthServiceBreaker);
router.get('/test/project', circuitBreakerController.testProjectManagerBreaker);
router.get('/stats', circuitBreakerController.getBreakerStatistics);

module.exports = router;

