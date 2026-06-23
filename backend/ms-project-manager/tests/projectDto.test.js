import {
  createProjectDto,
  pickProjectScheduleFields,
  projectToDto,
  projectsToDto
} from '../src/dtos/projectDto.js';

describe('projectDto', () => {
  test('createProjectDto recorta strings', () => {
    expect(createProjectDto({ name: '  Alpha  ', description: ' Desc ' })).toEqual({
      name: 'Alpha',
      description: 'Desc'
    });
  });

  test('projectToDto formatea fechas', () => {
    const dto = projectToDto({
      id: 'p1',
      name: 'Proyecto',
      description: 'X',
      startDate: new Date('2026-06-01T12:00:00Z'),
      endDate: '2026-12-01'
    });
    expect(dto.startDate).toBe('2026-06-01');
    expect(dto.status).toBe('active');
  });

  test('projectsToDto devuelve arreglo vacío si input inválido', () => {
    expect(projectsToDto(null)).toEqual([]);
  });

  test('pickProjectScheduleFields normaliza fechas vacías', () => {
    expect(pickProjectScheduleFields({ startDate: '', endDate: null })).toEqual({
      startDate: null,
      endDate: null
    });
  });
});
