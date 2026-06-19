import { mapUserRow, mapUserRows, pickName, pickRole } from '../src/utils/userRowMapper.js';

describe('userRowMapper', () => {
  test('mapUserRow converts database columns to English properties', () => {
    expect(
      mapUserRow({
        id: 1,
        nombre: 'Ana',
        email: 'a@test.cl',
        rol: 'gestor',
        habilidades: 'Node',
        disponibilidad: 'disponible',
        horas_semanales_disponibles: 30,
        created_at: '2026-01-01',
        updated_at: '2026-01-02'
      })
    ).toEqual({
      id: 1,
      name: 'Ana',
      email: 'a@test.cl',
      role: 'gestor',
      password: undefined,
      skills: 'Node',
      availability: 'disponible',
      weeklyAvailableHours: 30,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02'
    });
  });

  test('pickName and pickRole accept English and legacy Spanish keys', () => {
    expect(pickName({ name: 'English' })).toBe('English');
    expect(pickName({ nombre: 'Spanish' })).toBe('Spanish');
    expect(pickRole({ role: 'gestor' })).toBe('gestor');
    expect(pickRole({ rol: 'directivo' })).toBe('directivo');
  });

  test('mapUserRows maps arrays', () => {
    expect(mapUserRows([{ id: 1, nombre: 'A', email: 'a@t.cl', rol: 'gestor' }])).toHaveLength(1);
  });
});
