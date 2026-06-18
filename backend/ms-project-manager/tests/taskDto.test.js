import { createTaskDto, taskToDto, pickTaskScheduleFields } from '../src/dtos/taskDto.js';

describe('taskDto', () => {
  test('createTaskDto normaliza título y descripción', () => {
    const dto = createTaskDto({
      title: '  Mi tarea  ',
      description: '  Detalle  ',
      completed: false
    });
    expect(dto.title).toBe('Mi tarea');
    expect(dto.description).toBe('Detalle');
  });

  test('taskToDto mapea fechas y estado por defecto', () => {
    const dto = taskToDto({
      id: '1',
      projectId: '2',
      title: 'T',
      description: 'D',
      completed: false,
      startDate: new Date('2026-01-15T00:00:00.000Z'),
      endDate: null,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02'
    });
    expect(dto.status).toBe('PENDING');
    expect(dto.startDate).toBe('2026-01-15');
  });

  test('pickTaskScheduleFields extrae fechas opcionales', () => {
    const fields = pickTaskScheduleFields({
      startDate: '2026-02-01',
      endDate: ''
    });
    expect(fields.startDate).toBe('2026-02-01');
    expect(fields.endDate).toBeNull();
  });
});
