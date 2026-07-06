/**
 * Utilidades de usuario para ms-auth (hashing no aplica aquí; solo verificación y rol por defecto).
 */
import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';
import { DEFAULT_ROLE } from '../config/roles.js';

class UserService {
  /**
   * Compara contraseña en texto plano con hash bcrypt almacenado.
   * @param {string} plainPassword - Contraseña del login
   * @param {string} hashedPassword - Hash desde ms-users
   * @returns {Promise<boolean>} true si coinciden
   */
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

  /**
   * Rol asignado por defecto en registro cuando el cliente no envía role.
   * @returns {string} Nombre del rol (ej. `profesional`)
   */
  getDefaultRole() {
    return DEFAULT_ROLE;
  }
}

export default new UserService();
