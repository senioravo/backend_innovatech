import { query } from '../src/config/database.js';
import userRepository from '../src/repositories/userRepository.js';

describe('userRepository', () => {
  beforeEach(() => {
    query.mockReset();
    query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  test('emailExists returns true when row exists', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    await expect(userRepository.emailExists('test@mail.cl')).resolves.toBe(true);
    expect(query).toHaveBeenCalledWith('SELECT id FROM usuarios WHERE email = $1', ['test@mail.cl']);
  });

  test('findById returns null when missing', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await expect(userRepository.findById(99)).resolves.toBeNull();
  });

  test('findById maps database row to domain user', async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 1, nombre: 'Ana', email: 'a@a.cl', rol: 'gestor', created_at: '2026-01-01', updated_at: '2026-01-02' }]
    });
    await expect(userRepository.findById(1)).resolves.toMatchObject({
      id: 1,
      name: 'Ana',
      email: 'a@a.cl',
      role: 'gestor'
    });
  });

  test('findAll paginates results', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ id: 1, nombre: 'Ana', email: 'a@a.cl', rol: 'gestor', created_at: '2026-01-01', updated_at: '2026-01-01' }]
      })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const result = await userRepository.findAll({ page: 1, limit: 10 });

    expect(result.users).toHaveLength(1);
    expect(result.users[0].name).toBe('Ana');
    expect(result.pagination.total).toBe(1);
  });

  test('delete returns true when row removed', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 2 }] });
    await expect(userRepository.delete(2)).resolves.toBe(true);
  });

  test('findProfessionals lists professionals and managers', async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 3, nombre: 'Pro', email: 'p@t.cl', rol: 'profesional', habilidades: '', disponibilidad: 'disponible', horas_semanales_disponibles: 40 }]
    });
    const rows = await userRepository.findProfessionals();
    expect(rows).toHaveLength(1);
    expect(rows[0].role).toBe('profesional');
  });

  test('updateProfile updates profile fields', async () => {
    query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        nombre: 'Ana',
        email: 'a@a.cl',
        rol: 'gestor',
        habilidades: 'Java',
        disponibilidad: 'disponible',
        horas_semanales_disponibles: 40,
        created_at: '2026-01-01',
        updated_at: '2026-01-02'
      }]
    });
    const row = await userRepository.updateProfile(1, { habilidades: 'Java' });
    expect(row.skills).toBe('Java');
  });

  test('create inserts user with English input', async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 5, nombre: 'New', email: 'n@t.cl', rol: 'gestor', created_at: '2026-01-01', updated_at: '2026-01-01' }]
    });
    const user = await userRepository.create({
      name: 'New',
      email: 'n@t.cl',
      passwordHash: 'hash',
      role: 'gestor'
    });
    expect(user.name).toBe('New');
    expect(user.role).toBe('gestor');
  });
});
