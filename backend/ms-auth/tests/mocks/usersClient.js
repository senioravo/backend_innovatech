import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';

const usersByEmail = new Map();

const usersClient = {
  findByEmailWithPassword: jest.fn(async (email) => {
    return usersByEmail.get(String(email).toLowerCase()) || null;
  }),
  createUser: jest.fn(async (userData) => {
    const email = String(userData.email).toLowerCase();
    if (usersByEmail.has(email)) {
      throw new Error('El email ya está registrado');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 4);
    const user = {
      id: usersByEmail.size + 1,
      nombre: userData.nombre,
      email,
      password: hashedPassword,
      rol: userData.rol || 'gestor',
      created_at: new Date().toISOString()
    };
    usersByEmail.set(email, user);
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      created_at: user.created_at
    };
  })
};

export default usersClient;
