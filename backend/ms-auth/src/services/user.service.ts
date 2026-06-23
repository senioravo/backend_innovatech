// @ts-nocheck
import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';
import { DEFAULT_ROLE } from '../config/roles.js';

class UserService {
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error('[UserService] Error al verificar contraseña', {
        error: error.message,
        taskId: 'AS-TASK-21'
      });
      throw new Error('Error al verificar contraseña');
    }
  }

  getDefaultRole() {
    return DEFAULT_ROLE;
  }
}

export default new UserService();
