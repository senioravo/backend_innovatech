import { query } from '../src/config/database.js';
import userRepository from '../src/repositories/userRepository.js';

describe('userRepository', () => {
  beforeEach(() => {
    query.mockReset();
    query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  test('emailExists devuelve true si hay filas', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    await expect(userRepository.emailExists('test@mail.cl')).resolves.toBe(true);
    expect(query).toHaveBeenCalledWith('SELECT id FROM usuarios WHERE email = $1', ['test@mail.cl']);
  });

  test('findById devuelve null si no existe', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await expect(userRepository.findById(99)).resolves.toBeNull();
  });

  test('findById devuelve usuario', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'a@a.cl' }] });
    await expect(userRepository.findById(1)).resolves.toEqual({ id: 1, email: 'a@a.cl' });
  });

  test('findAll pagina resultados', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 1, email: 'a@a.cl' }] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const result = await userRepository.findAll({ page: 1, limit: 10 });

    expect(result.users).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  test('delete devuelve true si eliminó fila', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 2 }] });
    await expect(userRepository.delete(2)).resolves.toBe(true);
  });

  test('findProfessionals lista profesionales y gestores', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 3, rol: 'profesional' }] });
    const rows = await userRepository.findProfessionals();
    expect(rows).toHaveLength(1);
  });

  test('updateProfile actualiza campos de perfil', async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 1, habilidades: 'Java', disponibilidad: 'disponible' }]
    });
    const row = await userRepository.updateProfile(1, { habilidades: 'Java' });
    expect(row.habilidades).toBe('Java');
  });
});
