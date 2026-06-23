import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginPage from './LoginPage';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Innovatech — Login/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('submits credentials', async () => {
    mockLogin.mockResolvedValueOnce({ token: 't', user: { email: 'a@test.cl' } });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    await user.type(screen.getByRole('textbox'), 'a@test.cl');
    await user.type(screen.getByLabelText(/Contraseña/i), 'secret');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(mockLogin).toHaveBeenCalledWith('a@test.cl', 'secret');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('shows error on failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciales incorrectas'));
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    await user.type(screen.getByRole('textbox'), 'a@test.cl');
    await user.type(screen.getByLabelText(/Contraseña/i), 'x');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Credenciales incorrectas')).toBeInTheDocument();
  });
});
