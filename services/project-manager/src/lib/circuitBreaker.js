class CircuitBreakerOpenError extends Error {
  constructor(serviceName) {
    super(`Circuit breaker abierto: ${serviceName}`);
    this.name = 'CircuitBreakerOpenError';
    this.serviceName = serviceName;
  }
}

/**
 * Circuit breaker por dependencia (CLOSED → OPEN → HALF_OPEN).
 * Envuelve operaciones async (p. ej. fetch a otro microservicio).
 */
class CircuitBreaker {
  constructor({
    name,
    failureThreshold = 5,
    resetTimeoutMs = 30000,
    successThreshold = 1
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

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      nextAttemptAt: this.nextAttemptAt
    };
  }

  open() {
    this.state = 'OPEN';
    this.nextAttemptAt = Date.now() + this.resetTimeoutMs;
    this.failures = 0;
    this.successes = 0;
  }

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

  onFailure() {
    if (this.state === 'HALF_OPEN') {
      this.open();
      return;
    }
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.open();
    }
  }

  async execute(operation) {
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now < this.nextAttemptAt) {
        throw new CircuitBreakerOpenError(this.name);
      }
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
