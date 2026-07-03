// AS-TASK-03: Configurar Circuit Breaker para llamadas internas
// Implementaci�n del patr�n Circuit Breaker usando Opossum

import CircuitBreaker from 'opossum';

/**
 * Configuraci�n del Circuit Breaker seg�n requisitos AS-TASK-03
 * - Timeout: 3000ms
 * - Error Threshold: 50% (threshold: 0.5)
 * - Fallback: "Servicio no disponible"
 */
const circuitBreakerOptions = {
  timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 3000, // 3 segundos
  errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD) || 50, // 50%
  resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 30000, // 30 segundos para intentar cerrar
  rollingCountTimeout: 10000, // Ventana de tiempo para calcular errores
  rollingCountBuckets: 10, // N�mero de buckets en la ventana
  name: 'InnovatechCircuitBreaker'
};

/**
 * Crear Circuit Breaker para envolver llamadas a servicios internos
 * @param {Function} asyncFunction - Funci�n as�ncrona a proteger
 * @param {String} serviceName - Nombre del servicio para logs
 * @returns {CircuitBreaker} Instancia del Circuit Breaker configurado
 */
function createCircuitBreaker(asyncFunction, serviceName = 'Unknown Service') {
  const breaker = new CircuitBreaker(asyncFunction, circuitBreakerOptions);

  // AS-TASK-03: Configurar fallback que devuelva "Servicio no disponible"
  breaker.fallback(() => {
    console.warn(`[Circuit Breaker - ${serviceName}] ??  Fallback activado: Servicio no disponible`);
    return {
      success: false,
      message: 'Servicio no disponible',
      serviceName: serviceName,
      taskId: 'AS-TASK-03'
    };
  });

  // AS-TASK-03: Integrar logs para observabilidad
  breaker.on('open', () => {
    console.error(`[Circuit Breaker - ${serviceName}] ?? ABIERTO: Demasiados errores detectados`);
  });

  breaker.on('halfOpen', () => {
    console.warn(`[Circuit Breaker - ${serviceName}] ?? SEMI-ABIERTO: Intentando recuperaci�n`);
  });

  breaker.on('close', () => {
    console.log(`[Circuit Breaker - ${serviceName}] ?? CERRADO: Servicio funcionando normalmente`);
  });

  breaker.on('success', (result) => {
    console.log(`[Circuit Breaker - ${serviceName}]  Llamada exitosa`);
  });

  breaker.on('failure', (error) => {
    console.error(`[Circuit Breaker - ${serviceName}] NO Fallo detectado:`, error.message);
  });

  breaker.on('timeout', () => {
    console.error(`[Circuit Breaker - ${serviceName}] ??  Timeout excedido (${circuitBreakerOptions.timeout}ms)`);
  });

  breaker.on('reject', () => {
    console.warn(`[Circuit Breaker - ${serviceName}] ?? Llamada rechazada: Circuit Breaker abierto`);
  });

  return breaker;
}

/**
 * Obtener estad�sticas del Circuit Breaker
 * @param {CircuitBreaker} breaker - Instancia del Circuit Breaker
 * @returns {Object} Estad�sticas del breaker
 */
function getBreakerStats(breaker) {
  const stats = breaker.stats;
  return {
    fires: stats.fires,
    successes: stats.successes,
    failures: stats.failures,
    rejects: stats.rejects,
    timeouts: stats.timeouts,
    fallbacks: stats.fallbacks,
    opened: breaker.opened,
    halfOpen: breaker.halfOpen,
    closed: breaker.closed,
    taskId: 'AS-TASK-03'
  };
}

export { createCircuitBreaker, getBreakerStats, circuitBreakerOptions };