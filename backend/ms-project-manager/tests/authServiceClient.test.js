import { getAuthDependencyStatus } from '../src/clients/authServiceClient.js';

describe('authServiceClient', () => {
  test('getAuthDependencyStatus sin URL configurada', async () => {
    const status = await getAuthDependencyStatus();
    expect(status).toEqual({ configured: false });
  });
});
