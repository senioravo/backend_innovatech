/** Tests de smoke de App (ruta login). */
import { render, screen } from '@testing-library/react';
import LoginPage from './pages/LoginPage';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('./auth/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

describe('App routes', () => {
  it('renders login page', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Innovatech — Login/i)).toBeInTheDocument();
  });
});
