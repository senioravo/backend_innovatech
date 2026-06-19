import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../auth/AuthContext';
import { vi } from 'vitest';

const bffMocks = vi.hoisted(() => ({
  getStoredUser: vi.fn(() => ({ email: 'a@test.cl', role: 'gestor' })),
  getToken: vi.fn(() => 'jwt-token'),
  login: vi.fn(),
  logout: vi.fn()
}));

vi.mock('../api/bffClient', () => bffMocks);

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    bffMocks.getStoredUser.mockReturnValue({ email: 'a@test.cl', role: 'gestor' });
    bffMocks.getToken.mockReturnValue('jwt-token');

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Secret area</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Secret area')).toBeInTheDocument();
  });

  it('redirects when not authenticated', () => {
    bffMocks.getStoredUser.mockReturnValue(null);
    bffMocks.getToken.mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Secret area</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.queryByText('Secret area')).not.toBeInTheDocument();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});
