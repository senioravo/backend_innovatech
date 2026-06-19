import { jest } from '@jest/globals';

export default {
  findByUserId: jest.fn(),
  findByIdAndUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};
