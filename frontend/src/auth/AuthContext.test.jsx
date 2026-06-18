import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('../api/bffClient', () => ({
  getStoredUser: vi.fn(() => null),
  getToken: vi.fn(() => null),
  login: vi.fn(),
  logout: vi.fn()
}));

import * as bffClient from '../api/bffClient';

function AuthProbe() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'si' : 'no'}</span>
      <span data-testid="email">{user?.email ?? 'sin-user'}</span>
      <button type="button" onClick={() => login('a@test.cl', 'pass')}>
        login
      </button>
      <button type="button" onClick={() => logout()}>
        logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  it('inicia sin autenticación', () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth')).toHaveTextContent('no');
  });

  it('login actualiza usuario y token en contexto', async () => {
    bffClient.login.mockResolvedValueOnce({
      token: 'jwt-1',
      usuario: { email: 'a@test.cl', rol: 'gestor' }
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('si');
      expect(screen.getByTestId('email')).toHaveTextContent('a@test.cl');
    });
  });

  it('logout limpia la sesión', async () => {
    bffClient.getToken.mockReturnValue('jwt-1');
    bffClient.getStoredUser.mockReturnValue({ email: 'a@test.cl' });
    bffClient.logout.mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('si'));
    await userEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('no');
      expect(bffClient.logout).toHaveBeenCalled();
    });
  });

  it('useAuth lanza error fuera del provider', () => {
    expect(() => render(<AuthProbe />)).toThrow('useAuth debe usarse dentro de AuthProvider');
  });
});
