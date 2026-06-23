import { jest } from '@jest/globals';
import authOrchestrationService from '../src/application/auth/authOrchestrationService.js';
import projectManagerUpstreamClient from '../src/infrastructure/clients/projectManagerUpstreamClient.js';
import proyectosOrchestrationService from '../src/application/proyectos/proyectosOrchestrationService.js';

describe('proyectosOrchestrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('listProyectos combina PM y catálogo de roles', async () => {
    projectManagerUpstreamClient.listProjects.mockResolvedValueOnce({
      data: {
        projects: [{ id: 'p1', name: 'Alpha', assigneeId: '10' }]
      }
    });
    jest.spyOn(authOrchestrationService, 'getRoles').mockResolvedValueOnce({
      data: { data: [{ nombre: 'gestor', descripcion: 'Gestor', permisos: ['create'] }] }
    });
    jest.spyOn(authOrchestrationService, 'getUserById').mockResolvedValueOnce({
      data: { data: { id: 10, email: 'u@test.cl', rol: 'gestor' } }
    });

    const req = {
      user: { id: 1, email: 'gestor@test.cl', role: 'gestor' },
      headers: {}
    };

    const result = await proyectosOrchestrationService.listProyectos(req);

    expect(result.projects).toHaveLength(1);
    expect(result.user.email).toBe('gestor@test.cl');
    expect(result.projects[0].name).toBe('Alpha');
  });

  test('listTareasByProyecto devuelve resumen', async () => {
    projectManagerUpstreamClient.listTasksByProject.mockResolvedValueOnce({
      data: {
        tasks: [
          { id: 't1', title: 'T1', status: 'DONE', assigneeId: null },
          { id: 't2', title: 'T2', status: 'PENDING', assigneeId: null }
        ]
      }
    });

    const result = await proyectosOrchestrationService.listTareasByProyecto('p1', {
      user: { id: 1, email: 'g@test.cl', role: 'gestor' },
      headers: {}
    });

    expect(result.projectId).toBe('p1');
    expect(result.tasks).toHaveLength(2);
    expect(result.summary.total).toBe(2);
  });
});
