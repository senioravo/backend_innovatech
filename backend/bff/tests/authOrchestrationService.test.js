import { jest } from '@jest/globals';
import authUpstreamClient from '../src/infrastructure/clients/authUpstreamClient.js';
import authOrchestrationService from '../src/application/auth/authOrchestrationService.js';

describe('authOrchestrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register delega en upstream', async () => {
    authUpstreamClient.register.mockResolvedValue({ id: 1 });
    const result = await authOrchestrationService.register({ email: 'a@b.com' });
    expect(result).toEqual({ id: 1 });
    expect(authUpstreamClient.register).toHaveBeenCalled();
  });

  test('login delega en upstream', async () => {
    authUpstreamClient.login.mockResolvedValue({ token: 'abc' });
    const result = await authOrchestrationService.login({ email: 'a@b.com', password: 'x' });
    expect(result.token).toBe('abc');
  });

  test('health delega en upstream', async () => {
    authUpstreamClient.health.mockResolvedValue({ status: 'OK' });
    const result = await authOrchestrationService.health();
    expect(result.status).toBe('OK');
  });
});
