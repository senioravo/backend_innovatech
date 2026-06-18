// @ts-nocheck
// AS-TASK-12: Middleware de Auditoría para accesos y operaciones críticas
// Responsabilidad: Interceptar requests y registrar accesos automáticamente
// Principio SOLID: Single Responsibility - Solo audita accesos a endpoints
import logger from '../utils/logger.js';
/**
 * Middleware de auditoría - Registra accesos a endpoints protegidos
 * Características:
 * - Mide tiempo de respuesta
 * - Registra método HTTP, endpoint, usuario, IP
 * - Registra código de estado de respuesta
 * - No bloquea flujo de la aplicación
 * - Incluye taskId AS-TASK-12
 *
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware
 */
const auditMiddleware = (req, res, next) => {
    const startTime = Date.now();
    // Interceptar el método res.json para capturar el código de estado
    const originalJson = res.json.bind(res);
    res.json = function (data) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        // Registrar acceso en logger
        try {
            logger.logEndpointAccess(req, responseTime, statusCode);
        }
        catch (error) {
            console.error('[AUDIT-MIDDLEWARE] Error al registrar acceso:', error.message);
        }
        // Continuar con la respuesta original
        return originalJson(data);
    };
    // Interceptar el método res.send para respuestas que no usan json
    const originalSend = res.send.bind(res);
    res.send = function (data) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        // Registrar acceso en logger
        try {
            logger.logEndpointAccess(req, responseTime, statusCode);
        }
        catch (error) {
            console.error('[AUDIT-MIDDLEWARE] Error al registrar acceso:', error.message);
        }
        // Continuar con la respuesta original
        return originalSend(data);
    };
    // Continuar con el siguiente middleware
    next();
};
/**
 * Middleware de auditoría para operaciones críticas específicas
 * Uso: Aplicar a endpoints de registro, login, logout, cambio de rol, eliminación
 *
 * @param {string} operationName - Nombre de la operación (REGISTER, LOGIN, LOGOUT, etc.)
 * @returns {Function} - Middleware function
 */
const auditCriticalOperation = (operationName) => {
    return (req, res, next) => {
        const startTime = Date.now();
        // Interceptar respuesta para registrar operación crítica
        const originalJson = res.json.bind(res);
        res.json = function (data) {
            const responseTime = Date.now() - startTime;
            const statusCode = res.statusCode;
            const user = req.user || {};
            const body = req.body || {};
            // Datos de la operación crítica
            const operationData = {
                success: statusCode >= 200 && statusCode < 300,
                userId: user.id || body.id || null,
                email: user.email || body.email || null,
                ip: req.ip || req.connection?.remoteAddress || 'N/A',
                detail: `${req.method} ${req.path} - Status:${statusCode}`,
                error: data.message || null,
                responseTime,
                taskId: 'AS-TASK-12'
            };
            // Registrar operación crítica
            try {
                logger.logCriticalOperation(operationName, operationData);
            }
            catch (error) {
                console.error('[AUDIT-MIDDLEWARE] Error al registrar operación crítica:', error.message);
            }
            // Continuar con la respuesta original
            return originalJson(data);
        };
        next();
    };
};
/**
 * Middleware de auditoría para operaciones rechazadas (sin autenticación/autorización)
 * Uso: Capturar intentos de acceso no autorizados
 *
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware
 */
const auditUnauthorizedAccess = (req, res, next) => {
    const startTime = Date.now();
    // Interceptar respuestas 401/403
    const originalStatus = res.status.bind(res);
    res.status = function (statusCode) {
        if (statusCode === 401 || statusCode === 403) {
            const responseTime = Date.now() - startTime;
            // Registrar intento de acceso no autorizado
            try {
                logger.auditWarning({
                    userId: req.user?.id || 'N/A',
                    email: req.user?.email || req.body?.email || 'N/A',
                    operation: `${req.method} ${req.path}`,
                    detail: `Acceso denegado - Status:${statusCode}`,
                    ip: req.ip || req.connection?.remoteAddress || 'N/A',
                    responseTime,
                    taskId: 'AS-TASK-12'
                });
            }
            catch (error) {
                console.error('[AUDIT-MIDDLEWARE] Error al registrar acceso no autorizado:', error.message);
            }
        }
        // Continuar con el status original
        return originalStatus(statusCode);
    };
    next();
};
export { auditMiddleware, auditCriticalOperation, auditUnauthorizedAccess };
