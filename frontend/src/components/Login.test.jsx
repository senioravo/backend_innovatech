import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';

vi.mock('../services/api', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn()
}));

import { loginUser, registerUser } from '../services/api';

describe('Login component', () => {
  const onSuccess = vi.fn();
  const setLoading = vi.fn();
  const setError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza formulario de login', () => {
    render(<Login onSuccess={onSuccess} setLoading={setLoading} setError={setError} />);

    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
  });

  it('envía credenciales y llama onSuccess', async () => {
    loginUser.mockResolvedValueOnce({
      user: { email: 'a@a.cl' },
      token: 'tok'
    });

    render(<Login onSuccess={onSuccess} setLoading={setLoading} setError={setError} />);

    await userEvent.type(screen.getByPlaceholderText('nombre@empresa.cl'), 'a@a.cl');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({ email: 'a@a.cl', password: 'Secret123' });
      expect(onSuccess).toHaveBeenCalledWith({ email: 'a@a.cl' }, 'tok');
    });
  });

  it('muestra error si credenciales inválidas', async () => {
    loginUser.mockResolvedValueOnce({ message: 'Credenciales inválidas' });

    render(<Login onSuccess={onSuccess} setLoading={setLoading} setError={setError} />);

    await userEvent.type(screen.getByPlaceholderText('nombre@empresa.cl'), 'bad@a.cl');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith('Credenciales inválidas');
    });
  });

  it('cambia a modo registro', async () => {
    registerUser.mockResolvedValueOnce({ user: { email: 'n@n.cl' }, token: 't2' });

    render(<Login onSuccess={onSuccess} setLoading={setLoading} setError={setError} />);

    await userEvent.click(screen.getByRole('button', { name: 'Regístrate' }));
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('nombre@empresa.cl'), 'n@n.cl');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
    });
  });
});
