import { jest } from '@jest/globals';

export default {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getRoles: jest.fn(),
  getRolesSimple: jest.fn(),
  updateUserRole: jest.fn(),
  health: jest.fn(),
  getUserById: jest.fn()
};
