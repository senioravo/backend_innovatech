import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'gestor@test.cl', rol: 'gestor' },
    logout: mockLogout
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('../api/bffClient', () => ({
  fetchProyectos: vi.fn(),
  fetchTareas: vi.fn(),
  fetchKpis: vi.fn(),
  fetchNotifications: vi.fn(),
  createProject: vi.fn(),
  createTask: vi.fn(),
  patchTaskStatus: vi.fn(),
  deleteProject: vi.fn(),
  deleteTask: vi.fn(),
  downloadReport: vi.fn(),
  addTaskComment: vi.fn(),
  addTaskAttachment: vi.fn(),
  fetchTaskComments: vi.fn(),
  fetchTaskAttachments: vi.fn()
}));

import * as bff from '../api/bffClient';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bff.fetchProyectos.mockResolvedValue({
      usuario: { rol: 'gestor', email: 'gestor@test.cl' },
      proyectos: [{ id: 'p1', nombre: 'Proyecto Alpha', descripcion: 'Desc' }]
    });
    bff.fetchKpis.mockResolvedValue({
      avanceProyectosPct: 50,
      tareasCompletadas: 1,
      tareasTotales: 4,
      utilizacionRecursos: { utilizacionPct: 75 }
    });
    bff.fetchNotifications.mockResolvedValue({
      notifications: [{ id: 'n1', title: 'Aviso', message: 'Tarea asignada' }]
    });
    bff.fetchTareas.mockResolvedValue({
      tareas: [
        { id: 't1', titulo: 'Tarea 1', estado: 'PENDING', completada: false }
      ],
      resumen: { total: 4, porEstado: { DONE: 1, PENDING: 3 } }
    });
    bff.fetchTaskComments.mockResolvedValue({ comments: [] });
    bff.fetchTaskAttachments.mockResolvedValue({ attachments: [] });
  });

  it('carga y muestra proyectos del BFF', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Proyecto Alpha')).toBeInTheDocument();
    expect(bff.fetchProyectos).toHaveBeenCalled();
    expect(bff.fetchKpis).toHaveBeenCalled();
  });

  it('muestra KPIs y notificaciones para gestor', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await screen.findByText('Proyecto Alpha');
    expect(await screen.findByText(/Aviso/)).toBeInTheDocument();
  });

  it('carga tareas al seleccionar proyecto', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Ver tareas' }));

    await waitFor(() => {
      expect(bff.fetchTareas).toHaveBeenCalledWith('p1');
      expect(screen.getByText('Tarea 1')).toBeInTheDocument();
    });
  });

  it('crea proyecto cuando el rol es gestor', async () => {
    bff.createProject.mockResolvedValueOnce({ id: 'p2' });
    bff.fetchProyectos.mockResolvedValueOnce({
      usuario: { rol: 'gestor' },
      proyectos: [{ id: 'p1', nombre: 'Proyecto Alpha' }]
    });
    bff.fetchProyectos.mockResolvedValueOnce({
      usuario: { rol: 'gestor' },
      proyectos: [
        { id: 'p1', nombre: 'Proyecto Alpha' },
        { id: 'p2', nombre: 'Nuevo' }
      ]
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await screen.findByText('Proyecto Alpha');

    const nameInput = screen.getByPlaceholderText('Nombre');
    await userEvent.type(nameInput, 'Nuevo');
    await userEvent.type(screen.getByPlaceholderText('Descripción'), 'Detalle del proyecto');
    await userEvent.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => {
      expect(bff.createProject).toHaveBeenCalled();
    });
  });

  it('cierra sesión y redirige a login', async () => {
    mockLogout.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole('button', { name: /Cerrar sesión/i }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('redirige a login si el BFF responde 401', async () => {
    const err = new Error('Sesión expirada');
    err.status = 401;
    bff.fetchProyectos.mockRejectedValueOnce(err);
    mockLogout.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });
});
