// @ts-nocheck
export {};
// Cliente HTTP para comunicación con ms-users
// Responsabilidad: Facilitar llamadas entre microservicios

const logger = require('../utils/logger');

/**
 * Cliente para interactuar con el microservicio ms-users
 */
class UsersClient {
  constructor() {
    // URL base del microservicio de usuarios
    this.baseUrl = process.env.USERS_SERVICE_URL || 'http://users:3003';
    this.apiPrefix = '/api/users';
  }

  /**
   * Buscar usuario por email (con password incluido para login)
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado con password o null
   */
  async findByEmailWithPassword(email) {
    try {
      const url = `${this.baseUrl}${this.apiPrefix}/internal/by-email/${encodeURIComponent(email)}`;
      
      logger.info(`[UsersClient] Consultando usuario por email en ms-users`, { email });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Token interno para comunicación entre servicios
          'X-Internal-Service': 'ms-auth',
          'X-Internal-Token': process.env.INTERNAL_SERVICE_TOKEN || 'development-token'
        }
      });

      if (response.status === 404) {
        logger.info(`[UsersClient] Usuario no encontrado - Email: ${email}`);
        return null;
      }

      if (!response.ok) {
        throw new Error(`Error al consultar ms-users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      logger.info(`[UsersClient] Usuario encontrado - ID: ${data.id}`);
      
      return data;
    } catch (error) {
      logger.error('[UsersClient] Error al consultar ms-users', { 
        error: error.message,
        email 
      });
      
      // Si ms-users no está disponible, retornar null
      // Esto permite que ms-auth siga funcionando incluso si ms-users está caído
      return null;
    }
  }

  /**
   * Crear nuevo usuario en ms-users
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado
   */
  async createUser(userData) {
    try {
      const url = `${this.baseUrl}${this.apiPrefix}/internal`;
      
      logger.info(`[UsersClient] Creando usuario en ms-users`, { email: userData.email });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'ms-auth',
          'X-Internal-Token': process.env.INTERNAL_SERVICE_TOKEN || 'development-token'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear usuario en ms-users');
      }

      const data = await response.json();
      
      logger.info(`[UsersClient] Usuario creado exitosamente - ID: ${data.id}`);
      
      return data;
    } catch (error) {
      logger.error('[UsersClient] Error al crear usuario en ms-users', { 
        error: error.message 
      });
      throw error;
    }
  }
}

module.exports = new UsersClient();
