jest.mock('../src/infrastructure/clients/kpiUpstreamClient', () => ({
  getDashboard: jest.fn()
}));

const kpiUpstreamClient = require('../src/infrastructure/clients/kpiUpstreamClient');
const kpiOrchestrationService = require('../src/application/kpi/kpiOrchestrationService');

describe('kpiOrchestrationService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getDashboard transforma respuesta upstream al contrato frontend', async () => {
    kpiUpstreamClient.getDashboard.mockResolvedValue({
      data: {
        summary: {
          totalProjects: 2,
          totalTasks: 5,
          countByStatus: { PENDING: 2, DONE: 3 },
          completionRate: 0.6
        },
        projects: [{ id: 1, name: 'P1', description: 'Desc', startDate: null, endDate: null }],
        recentTasks: [
          {
            id: 9,
            title: 'Tarea A',
            status: 'DONE',
            completed: true,
            projectId: 1,
            projectName: 'P1'
          }
        ]
      }
    });

    const req = {
      user: { id: 7, email: 'u@test.com', role: 'gestor' },
      headers: { authorization: 'Bearer x' }
    };

    const payload = await kpiOrchestrationService.getDashboard(req);

    expect(payload.usuario.email).toBe('u@test.com');
    expect(payload.resumen.totalProyectos).toBe(2);
    expect(payload.resumen.totalTareas).toBe(5);
    expect(payload.resumen.tasaCompletadas).toBe(0.6);
    expect(payload.proyectos[0]).toEqual({
      id: 1,
      nombre: 'P1',
      descripcion: 'Desc',
      fechaInicio: null,
      fechaFin: null
    });
    expect(payload.tareasRecientes[0]).toEqual({
      id: 9,
      titulo: 'Tarea A',
      estado: 'DONE',
      completada: true,
      proyectoId: 1,
      proyectoNombre: 'P1'
    });
  });

  test('getDashboard tolera campos ausentes', async () => {
    kpiUpstreamClient.getDashboard.mockResolvedValue({ data: {} });
    const req = { user: { id: 1, email: 'a@b.com', role: 'directivo' }, headers: {} };

    const payload = await kpiOrchestrationService.getDashboard(req);

    expect(payload.resumen.totalProyectos).toBe(0);
    expect(payload.resumen.totalTareas).toBe(0);
    expect(payload.proyectos).toEqual([]);
    expect(payload.tareasRecientes).toEqual([]);
  });
});
