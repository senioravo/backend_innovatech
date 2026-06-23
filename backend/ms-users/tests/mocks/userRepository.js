import { jest } from '@jest/globals';

const userRepository = {
  emailExists: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updateRole: jest.fn(),
  findProfessionals: jest.fn(),
  updateProfile: jest.fn()
};

export default userRepository;
