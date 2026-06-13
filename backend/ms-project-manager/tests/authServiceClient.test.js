const { getAuthDependencyStatus } = require('../src/clients/authServiceClient');

describe('authServiceClient', () => {
  test('getAuthDependencyStatus sin URL configurada', async () => {
    const status = await getAuthDependencyStatus();
    expect(status).toEqual({ configured: false });
  });
});
