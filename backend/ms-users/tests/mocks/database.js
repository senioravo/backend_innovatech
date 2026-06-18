import { jest } from '@jest/globals';

export const query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
