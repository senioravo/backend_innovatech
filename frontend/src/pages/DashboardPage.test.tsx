/** Tests de integración UI del dashboard (proyectos, tareas, roles). */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'gestor@test.cl', role: 'gestor' },
    logout: mockLogout
  })
}));

vi.mock('../api/bffClient', () => ({
  fetchProjects: vi.fn(),
  fetchTasks: vi.fn(),
  fetchKpis: vi.fn(),
  fetchNotifications: vi.fn(),
  createProject: vi.fn(),
  createTask: vi.fn(),
  patchTaskStatus: vi.fn(),
  deleteProject: vi.fn(),
  deleteTask: vi.fn(),
  downloadReport: vi.fn(),
  fetchTaskComments: vi.fn(),
  fetchTaskAttachments: vi.fn(),
  addTaskComment: vi.fn(),
  addTaskAttachment: vi.fn()
}));

import {
  fetchProjects,
  fetchTasks,
  fetchKpis,
  fetchNotifications,
  createProject,
  createTask,
  patchTaskStatus,
  deleteProject,
  deleteTask,
  downloadReport,
  fetchTaskComments,
  fetchTaskAttachments,
  addTaskComment
} from '../api/bffClient';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(fetchProjects).mockResolvedValue({
      user: { email: 'gestor@test.cl', role: 'gestor' },
      projects: [{ id: 'p1', name: 'Alpha', description: 'Desc', startDate: '2026-01-01', endDate: '2026-02-01' }]
    });
    vi.mocked(fetchKpis).mockResolvedValue({
      projectProgressPct: 50,
      completedTasks: 1,
      totalTasks: 2,
      resourceUtilization: { utilizationPct: 40 }
    });
    vi.mocked(fetchNotifications).mockResolvedValue({
      notifications: [{ id: 'n1', title: 'Alerta', message: 'Revisar tarea' }]
    });
    vi.mocked(fetchTasks).mockResolvedValue({
      projectId: 'p1',
      tasks: [{ id: 't1', title: 'Task 1', status: 'PENDING', completed: false }],
      summary: { total: 1, byStatus: { PENDING: 1, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 } }
    });
    vi.mocked(fetchTaskComments).mockResolvedValue({ comments: [{ id: 'c1', userId: 'u1', content: 'Hola' }] });
    vi.mocked(fetchTaskAttachments).mockResolvedValue({ attachments: [] });
    vi.mocked(createProject).mockResolvedValue({});
    vi.mocked(createTask).mockResolvedValue({});
    vi.mocked(patchTaskStatus).mockResolvedValue({});
    vi.mocked(deleteProject).mockResolvedValue({});
    vi.mocked(deleteTask).mockResolvedValue({});
    vi.mocked(downloadReport).mockResolvedValue(undefined);
    vi.mocked(addTaskComment).mockResolvedValue({});
  });

  it('loads and displays projects', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText(/gestor@test.cl/i)).toBeInTheDocument();
    expect(screen.getByText(/Alerta/)).toBeInTheDocument();
  });

  it('loads tasks when project selected', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('button', { name: 'Ver tareas' }));
    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText(/Progreso del proyecto/i)).toBeInTheDocument();
  });

  it('creates a project', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await screen.findByText('Alpha');
    await user.type(screen.getByPlaceholderText('Nombre'), 'Beta');
    await user.type(screen.getByPlaceholderText('Descripción'), 'Nuevo proyecto');
    await user.click(screen.getByRole('button', { name: 'Crear' }));
    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Beta', description: 'Nuevo proyecto' })
      );
    });
  });

  it('creates a task for selected project', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('button', { name: 'Ver tareas' }));
    await screen.findByText('Task 1');
    await user.type(screen.getByPlaceholderText('Título'), 'Task 2');
    await user.click(screen.getByRole('button', { name: 'Crear tarea' }));
    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith('p1', expect.objectContaining({ title: 'Task 2' }));
    });
  });

  it('changes task status', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('button', { name: 'Ver tareas' }));
    await screen.findByText('Task 1');
    await user.selectOptions(screen.getByDisplayValue('Pendiente'), 'IN_PROGRESS');
    await waitFor(() => {
      expect(patchTaskStatus).toHaveBeenCalledWith('p1', 't1', 'IN_PROGRESS');
    });
  });

  it('shows friendly message on invalid status transition', async () => {
    vi.mocked(patchTaskStatus).mockRejectedValueOnce(new Error('Invalid status transition'));
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('button', { name: 'Ver tareas' }));
    await screen.findByText('Task 1');
    await user.selectOptions(screen.getByDisplayValue('Pendiente'), 'IN_PROGRESS');
    expect(await screen.findByText(/Solo puedes avanzar un paso/i)).toBeInTheDocument();
  });

  it('deletes project after confirmation', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(deleteProject).toHaveBeenCalledWith('p1'));
  });

  it('deletes task after confirmation', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('button', { name: 'Ver tareas' }));
    await screen.findByText('Task 1');
    await user.click(screen.getByRole('button', { name: /Eliminar tarea: Task 1/i }));
    await waitFor(() => expect(deleteTask).toHaveBeenCalledWith('t1'));
  });

  it('opens collaboration panel and submits comment', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('button', { name: 'Ver tareas' }));
    await screen.findByText('Task 1');
    await user.click(screen.getByRole('button', { name: 'Colaboración' }));
    expect(await screen.findByText(/Hola/)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Nuevo comentario'), 'Comentario test');
    await user.click(screen.getByRole('button', { name: 'Comentar' }));
    await waitFor(() => {
      expect(addTaskComment).toHaveBeenCalledWith('p1', 't1', 'Comentario test');
    });
  });

  it('downloads analytics report', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await screen.findByText(/Avance global/i);
    await user.click(screen.getByRole('button', { name: /Exportar reporte CSV/i }));
    expect(downloadReport).toHaveBeenCalledWith('csv');
  });

  it('logs out and navigates to login', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('redirects on 401', async () => {
    vi.mocked(fetchProjects).mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { status: 401 }));
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
