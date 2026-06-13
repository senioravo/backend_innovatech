const {
  createCircuitBreaker,
  getBreakerStats,
  circuitBreakerOptions
} = require('../src/utils/circuitBreaker');

describe('circuitBreaker', () => {
  test('circuitBreakerOptions usa valores de entorno', () => {
    expect(circuitBreakerOptions.timeout).toBe(3000);
    expect(circuitBreakerOptions.errorThresholdPercentage).toBe(50);
  });

  test('createCircuitBreaker ejecuta función exitosa', async () => {
    const breaker = createCircuitBreaker(async () => ({ ok: true }), 'TestService');
    const result = await breaker.fire();
    expect(result).toEqual({ ok: true });
  });

  test('createCircuitBreaker activa fallback tras fallos', async () => {
    const breaker = createCircuitBreaker(async () => {
      throw new Error('down');
    }, 'FailService');

    breaker.open();
    const result = await breaker.fire();
    expect(result).toMatchObject({
      success: false,
      message: 'Servicio no disponible'
    });
  });

  test('getBreakerStats expone métricas', async () => {
    const breaker = createCircuitBreaker(async () => 'ok', 'StatsService');
    await breaker.fire();
    const stats = getBreakerStats(breaker);
    expect(stats).toHaveProperty('fires');
    expect(stats.taskId).toBe('AS-TASK-03');
  });
});
