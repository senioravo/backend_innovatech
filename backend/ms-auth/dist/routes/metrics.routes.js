// @ts-nocheck
// AS-TASK-14: Rutas de métricas de Prometheus
// Responsabilidad: Exponer endpoint /metrics para scraping de Prometheus
// Principio SOLID: Single Responsibility - Solo maneja endpoints de métricas
import express from 'express';
const router = express.Router();
import { getMetrics } from '../middleware/metricsMiddleware.js';
/**
 * GET /metrics - Endpoint de métricas de Prometheus
 *
 * Este endpoint expone todas las métricas recopiladas en formato Prometheus.
 * Prometheus scrapeará este endpoint periódicamente (ej. cada 15 segundos).
 *
 * Métricas expuestas:
 * - auth_http_requests_total: Contador de peticiones HTTP
 * - auth_http_request_duration_seconds: Histograma de latencia
 * - auth_errors_total: Contador de errores de autenticación/autorización
 * - auth_critical_operations_total: Contador de operaciones críticas
 * - auth_active_users: Gauge de usuarios activos
 * - auth_service_*: Métricas por defecto de Node.js (CPU, memoria, etc.)
 *
 * Formato de respuesta: text/plain (Prometheus exposition format)
 *
 * @route GET /metrics
 * @returns {string} 200 - Métricas en formato Prometheus
 * @returns {object} 500 - Error al obtener métricas
 */
router.get('/metrics', async (req, res) => {
    try {
        // Obtener métricas en formato Prometheus
        const metrics = await getMetrics();
        // Configurar headers para Prometheus
        res.set('Content-Type', 'text/plain; version=0.0.4');
        res.send(metrics);
    }
    catch (error) {
        console.error('[METRICS] Error al obtener métricas:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener métricas',
            taskId: 'AS-TASK-14',
            error: error.message
        });
    }
});
/**
 * GET /metrics/health - Health check específico de métricas
 *
 * Verifica que el sistema de métricas esté funcionando correctamente.
 *
 * @route GET /metrics/health
 * @returns {object} 200 - Estado del sistema de métricas
 */
router.get('/metrics/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Sistema de métricas operativo',
        taskId: 'AS-TASK-14',
        data: {
            status: 'UP',
            timestamp: new Date().toISOString(),
            promClient: 'prom-client',
            version: 'unknown'
        }
    });
});
export default router;
