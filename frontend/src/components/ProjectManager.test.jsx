import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ProjectManager from './ProjectManager';

describe('ProjectManager', () => {
  const user = { name: 'Ana Gestora', email: 'ana@test.cl' };

  it('muestra mensaje vacío sin proyectos', () => {
    render(
      <ProjectManager user={user} projects={[]} onLogout={vi.fn()} onRefresh={vi.fn()} />
    );

    expect(screen.getByText(/Bienvenido, Ana Gestora/)).toBeInTheDocument();
    expect(screen.getByText(/No hay proyectos disponibles/)).toBeInTheDocument();
  });

  it('lista proyectos y dispara acciones', async () => {
    const onLogout = vi.fn();
    const onRefresh = vi.fn();
    const projects = [
      { id: '1', name: 'Portal Web', description: 'Sitio corporativo' },
      { id: '2', name: 'App móvil', description: '' }
    ];

    render(
      <ProjectManager
        user={user}
        projects={projects}
        onLogout={onLogout}
        onRefresh={onRefresh}
      />
    );

    expect(screen.getByText('Portal Web')).toBeInTheDocument();
    expect(screen.getByText(/Proyecto sin descripción adicional/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Actualizar proyectos' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
