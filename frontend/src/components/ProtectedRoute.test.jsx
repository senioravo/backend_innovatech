import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn()
}));

import { useAuth } from '../auth/AuthContext';

function PrivatePage() {
  return <div>Contenido privado</div>;
}

describe('ProtectedRoute', () => {
  it('redirige a login si no hay sesión', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Página login</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PrivatePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Página login')).toBeInTheDocument();
  });

  it('muestra children si hay sesión', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <PrivatePage />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });
});
