import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./pages/DashboardPage', () => ({
  default: () => <div>Dashboard mock</div>
}));

vi.mock('./pages/LoginPage', () => ({
  default: () => <div>Login mock</div>
}));

vi.mock('./auth/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: () => ({ isAuthenticated: false })
}));

describe('App', () => {
  it('muestra login en la ruta por defecto', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByText('Login mock')).toBeInTheDocument();
  });

  it('redirige rutas desconocidas hacia login', () => {
    window.history.pushState({}, '', '/ruta-inexistente');
    render(<App />);
    expect(screen.getByText('Login mock')).toBeInTheDocument();
  });
});
