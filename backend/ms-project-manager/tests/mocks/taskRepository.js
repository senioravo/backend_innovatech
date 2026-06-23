import { jest } from '@jest/globals';

export default {
  findByProjectId: jest.fn(),
  findByIdAndUserId: jest.fn(),
  findByProjectIdAndTaskId: jest.fn(),
  findForUserDashboard: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deleteByProjectId: jest.fn()
};
