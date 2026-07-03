class CircuitBreakerOpenError extends Error {
  serviceName: string;

  constructor(serviceName: string) {
    super(`Circuit breaker abierto: ${serviceName}`);
    this.name = 'CircuitBreakerOpenError';
    this.serviceName = serviceName;
  }
}

class CircuitBreaker {
  name: string;
  failureThreshold: number;
  resetTimeoutMs: number;
  successThreshold: number;
  state: string;
  failures: number;
  successes: number;
  nextAttemptAt: number;

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

  getState() {
    return { state: this.state, failures: this.failures, successes: this.successes };
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
    if (this.failures >= this.failureThreshold) this.open();
  }

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
