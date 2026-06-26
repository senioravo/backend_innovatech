import UserModel, { mapUserRow, mapUserRows } from '../src/models/userModel.js';
import { pickName, pickRole } from '../src/utils/userRowMapper.js';

describe('UserModel', () => {
  test('mapUserRow converts database columns to UserModel instances', () => {
    const user = mapUserRow({
      id: 1,
      nombre: 'Ana',
      email: 'a@test.cl',
      rol: 'gestor',
      habilidades: 'Node',
      disponibilidad: 'disponible',
      horas_semanales_disponibles: 30,
      created_at: '2026-01-01',
      updated_at: '2026-01-02'
    });

    expect(user).toBeInstanceOf(UserModel);
    expect(user.toSafeObject()).toEqual({
      id: 1,
      name: 'Ana',
      email: 'a@test.cl',
      role: 'gestor',
      skills: 'Node',
      availability: 'disponible',
      weeklyAvailableHours: 30,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02'
    });
    expect(user.hasRole('gestor')).toBe(true);
    expect(user.hasRole('directivo')).toBe(false);
  });

  test('mapUserRows maps arrays', () => {
    const users = mapUserRows([{ id: 1, nombre: 'A', email: 'a@t.cl', rol: 'gestor' }]);
    expect(users).toHaveLength(1);
    expect(users[0]).toBeInstanceOf(UserModel);
  });
});

describe('userRowMapper', () => {
  test('pickName and pickRole accept English and legacy Spanish keys', () => {
    expect(pickName({ name: 'English' })).toBe('English');
    expect(pickName({ nombre: 'Spanish' })).toBe('Spanish');
    expect(pickRole({ role: 'gestor' })).toBe('gestor');
    expect(pickRole({ rol: 'directivo' })).toBe('directivo');
  });
});
