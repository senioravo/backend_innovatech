/**
 * Implementación de circuit breaker para proteger llamadas HTTP internas.
 * Estados: CLOSED (normal), OPEN (rechaza peticiones), HALF_OPEN (prueba de recuperación).
 */

/**
 * Error lanzado cuando el circuit breaker está abierto y rechaza la operación.
 */
class CircuitBreakerOpenError extends Error {
  serviceName: string;

  /**
   * @param {string} serviceName - Nombre del servicio cuyo circuito está abierto.
   */
  constructor(serviceName: string) {
    super(`Circuit breaker abierto: ${serviceName}`);
    this.name = 'CircuitBreakerOpenError';
    this.serviceName = serviceName;
  }
}

/**
 * Circuit breaker con umbrales configurables de fallo y recuperación.
 */
class CircuitBreaker {
  name: string;
  failureThreshold: number;
  resetTimeoutMs: number;
  successThreshold: number;
  state: string;
  failures: number;
  successes: number;
  nextAttemptAt: number;

  /**
   * @param {object} options - Opciones de configuración del breaker.
   * @param {string} options.name - Identificador del servicio protegido.
   * @param {number} [options.failureThreshold=5] - Fallos consecutivos para abrir el circuito.
   * @param {number} [options.resetTimeoutMs=30000] - Tiempo en ms antes de pasar a half-open.
   * @param {number} [options.successThreshold=1] - Éxitos en half-open para volver a closed.
   */
  constructor({
    name,
    failureThreshold = 5,
    resetTimeoutMs = 30000,
    successThreshold = 1
  }: {
    name: string;
    failureThreshold?: number;
    resetTimeoutMs?: number;
    successThreshold?: number;
  }) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.successThreshold = successThreshold;
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.nextAttemptAt = 0;
  }

  /**
   * Devuelve el estado actual del circuit breaker para observabilidad.
   * @returns {{ state: string; failures: number; successes: number }}
   */
  getState() {
    return { state: this.state, failures: this.failures, successes: this.successes };
  }

  /**
   * Abre el circuito, bloqueando peticiones hasta el timeout de reset.
   * @returns {void}
   */
  open() {
    this.state = 'OPEN';
    this.nextAttemptAt = Date.now() + this.resetTimeoutMs;
    this.failures = 0;
    this.successes = 0;
  }

  /**
   * Registra una operación exitosa y puede cerrar el circuito desde half-open.
   * @returns {void}
   */
  onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successes += 1;
      if (this.successes >= this.successThreshold) {
        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
      }
    } else {
      this.failures = 0;
    }
  }

  /**
   * Registra un fallo; puede abrir el circuito si se supera el umbral.
   * @returns {void}
   */
  onFailure() {
    if (this.state === 'HALF_OPEN') {
      this.open();
      return;
    }
    this.failures += 1;
    if (this.failures >= this.failureThreshold) this.open();
  }

  /**
   * Ejecuta una operación async protegida por el circuit breaker.
   * @template T
   * @param {() => Promise<T>} operation - Función async cuya ejecución se protege.
   * @returns {Promise<T>} Resultado de la operación si el circuito lo permite.
   * @throws {CircuitBreakerOpenError} Si el circuito está abierto y aún no expiró el timeout.
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const now = Date.now();
    if (this.state === 'OPEN') {
      if (now < this.nextAttemptAt) throw new CircuitBreakerOpenError(this.name);
      this.state = 'HALF_OPEN';
      this.successes = 0;
    }
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }
}

module.exports = { CircuitBreaker, CircuitBreakerOpenError };
