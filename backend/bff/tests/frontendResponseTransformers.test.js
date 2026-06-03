const {
  toProyecto,
  toTarea,
  buildResumenTareas,
  buildUsuarioSesion,
  extractRolesCatalog
} = require('../src/application/transformers/frontendResponseTransformers');

describe('frontendResponseTransformers', () => {
  const userMap = new Map([
    ['u1', { id: 'u1', nombre: 'Ana', email: 'ana@test.com', rol: 'gestor' }]
  ]);

  test('toProyecto mapea campos al español', () => {
    const p = toProyecto(
      {
        id: 'p1',
        name: 'Proyecto A',
        description: 'Desc',
        assigneeId: 'u1',
        startDate: '2026-01-01',
        endDate: null,
        createdAt: '2026-01-01',
        updatedAt: null
      },
      userMap
    );
    expect(p.nombre).toBe('Proyecto A');
    expect(p.responsable.nombre).toBe('Ana');
  });

  test('toTarea incluye estado y completada', () => {
    const t = toTarea(
      {
        id: 't1',
        projectId: 'p1',
        title: 'Tarea',
        description: '',
        status: 'IN_PROGRESS',
        completed: false,
        assigneeId: null,
        startDate: null,
        endDate: null,
        createdAt: null,
        updatedAt: null
      },
      userMap
    );
    expect(t.titulo).toBe('Tarea');
    expect(t.estado).toBe('IN_PROGRESS');
    expect(t.completada).toBe(false);
  });

  test('buildResumenTareas cuenta por estado', () => {
    const resumen = buildResumenTareas([
      { estado: 'PENDING' },
      { estado: 'PENDING' },
      { estado: 'DONE' }
    ]);
    expect(resumen.total).toBe(3);
    expect(resumen.porEstado.PENDING).toBe(2);
    expect(resumen.porEstado.DONE).toBe(1);
  });

  test('buildUsuarioSesion une JWT con catálogo de roles', () => {
    const req = { user: { id: 1, email: 'a@b.com', role: 'gestor' } };
    const roles = extractRolesCatalog({
      data: [{ nombre: 'gestor', descripcion: 'Gestor', permisos: { proyectos: ['ver'] } }]
    });
    const usuario = buildUsuarioSesion(req, roles);
    expect(usuario.rol).toBe('gestor');
    expect(usuario.permisos.proyectos).toContain('ver');
  });
});
