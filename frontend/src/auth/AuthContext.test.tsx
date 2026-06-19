import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('../api/bffClient', () => ({
  getStoredUser: vi.fn(() => null),
  getToken: vi.fn(() => null),
  login: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined)
}));

import { login, logout } from '../api/bffClient';

function Probe() {
  const { user, isAuthenticated, login: doLogin, logout: doLogout } = useAuth();
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <button type="button" onClick={() => doLogin('a@test.cl', 'x')}>
        login
      </button>
      <button type="button" onClick={() => doLogout()}>
        logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  it('login updates context', async () => {
    vi.mocked(login).mockResolvedValueOnce({
      token: 'jwt',
      user: { email: 'a@test.cl', role: 'gestor' }
    });
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await user.click(screen.getByRole('button', { name: 'login' }));
    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('yes');
      expect(screen.getByTestId('email')).toHaveTextContent('a@test.cl');
    });
  });

  it('logout clears context', async () => {
    vi.mocked(login).mockResolvedValueOnce({
      token: 'jwt',
      user: { email: 'a@test.cl', role: 'gestor' }
    });
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await user.click(screen.getByRole('button', { name: 'login' }));
    await user.click(screen.getByRole('button', { name: 'logout' }));
    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(screen.getByTestId('auth')).toHaveTextContent('no');
    });
  });

  it('useAuth throws outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/AuthProvider/i);
    consoleError.mockRestore();
  });
});
