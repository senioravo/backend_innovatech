"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// AS-TASK-03: Servicio protegido con Circuit Breaker
// Ejemplo de integración con AuthService y ProjectManager
const { createCircuitBreaker } = require('../utils/circuitBreaker');
/**
 * Simular llamada al servicio de autenticación interno
 * En producción, esto haría una llamada HTTP real a otro microservicio
 */
async function callAuthService(userId) {
    // Simulación de llamada a microservicio
    return new Promise((resolve, reject) => {
        // Simular latencia de red
        const delay = Math.random() * 2000;
        setTimeout(() => {
            // Simular 30% de probabilidad de fallo para demostrar Circuit Breaker
            if (Math.random() > 0.7) {
                reject(new Error('AuthService no responde'));
            }
            else {
                resolve({
                    success: true,
                    userId: userId,
                    authenticated: true,
                    service: 'AuthService'
                });
            }
        }, delay);
    });
}
/**
 * Simular llamada al Project Manager Service
 */
async function callProjectManagerService(projectId) {
    return new Promise((resolve, reject) => {
        const delay = Math.random() * 2000;
        setTimeout(() => {
            if (Math.random() > 0.7) {
                reject(new Error('ProjectManager no responde'));
            }
            else {
                resolve({
                    success: true,
                    projectId: projectId,
                    projectName: 'Innovatech Backend',
                    service: 'ProjectManager'
                });
            }
        }, delay);
    });
}
// AS-TASK-03: Crear Circuit Breakers para cada servicio interno
const authServiceBreaker = createCircuitBreaker(callAuthService, 'AuthService');
const projectManagerBreaker = createCircuitBreaker(callProjectManagerService, 'ProjectManager');
/**
 * Validar usuario con Circuit Breaker
 * @param {String} userId - ID del usuario
 * @returns {Promise} Resultado de la validación
 */
async function validateUserWithBreaker(userId) {
    try {
        const result = await authServiceBreaker.fire(userId);
        return result;
    }
    catch (error) {
        // El fallback ya se activó automáticamente
        console.error('[InternalService] Error al validar usuario:', error.message);
        throw error;
    }
}
/**
 * Obtener proyecto con Circuit Breaker
 * @param {String} projectId - ID del proyecto
 * @returns {Promise} Datos del proyecto
 */
async function getProjectWithBreaker(projectId) {
    try {
        const result = await projectManagerBreaker.fire(projectId);
        return result;
    }
    catch (error) {
        console.error('[InternalService] Error al obtener proyecto:', error.message);
        throw error;
    }
}
/**
 * Obtener estadísticas de todos los Circuit Breakers
 */
function getAllBreakerStats() {
    const { getBreakerStats } = require('../utils/circuitBreaker');
    return {
        authService: getBreakerStats(authServiceBreaker),
        projectManager: getBreakerStats(projectManagerBreaker),
        taskId: 'AS-TASK-03'
    };
}
module.exports = {
    validateUserWithBreaker,
    getProjectWithBreaker,
    getAllBreakerStats,
    authServiceBreaker,
    projectManagerBreaker
};
