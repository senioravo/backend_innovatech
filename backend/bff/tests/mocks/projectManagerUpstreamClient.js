import { jest } from '@jest/globals';

export default {
  listProjects: jest.fn(),
  listTasksByProject: jest.fn(),
  forwardRequest: jest.fn()
};
