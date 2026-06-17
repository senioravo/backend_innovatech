import { projectToDto, createProjectDto } from '../src/dtos/projectDto.js';

describe('projectDto', () => {
  test('createProjectDto recorta name y description', () => {
    const dto = createProjectDto({
      name: '  Proyecto  ',
      description: '  Texto largo  '
    });
    expect(dto.name).toBe('Proyecto');
    expect(dto.description).toBe('Texto largo');
  });

  test('projectToDto mapea fechas a string YYYY-MM-DD', () => {
    const dto = projectToDto({
      id: 'uuid-1',
      name: 'N',
      description: 'D',
      assigneeId: null,
      status: 'active',
      startDate: new Date('2026-05-10T12:00:00.000Z'),
      endDate: null,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: null
    });
    expect(dto.id).toBe('uuid-1');
    expect(dto.status).toBe('active');
    expect(dto.startDate).toBe('2026-05-10');
    expect(dto.endDate).toBeNull();
  });
});
