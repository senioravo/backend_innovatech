// @ts-nocheck
export {};
// AS-TASK-04: Servicio de gestión de usuarios
// Responsabilidad: Lógica de negocio y acceso a datos de usuarios

const bcrypt = require('bcrypt');
const { query } = require('../config/database');

// AS-TASK-21: Importar Winston logger
const logger = require('../utils/logger');

// AS-TASK-08: Importar configuración de roles
const { ROLES, DEFAULT_ROLE, getAllRoles, isValidRole } = require('../config/roles');

// Constantes
const SALT_ROUNDS = 10;
const VALID_ROLES = getAllRoles(); // AS-TASK-08: Usar roles definidos en config

/**
 * Servicio de Usuario - Principios SOLID
 * Single Responsibility: Solo gestiona operaciones de usuarios en BD
 */
class UserService {
  
  /**
   * Verificar si un email ya existe en la BD
   * @param {string} email - Email a verificar
   * @returns {Promise<boolean>} - true si existe, false si no
   */
  async emailExists(email) {
    try {
      const result = await query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email.toLowerCase()]
      );
      return result.rows.length > 0;
    } catch (error) {
      logger.error('[UserService] Error al verificar email', { error: error.message, taskId: 'AS-TASK-21' });
      throw new Error('Error al verificar email en base de datos');
    }
  }

  /**
   * Crear un nuevo usuario en la BD
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado (sin password)
   */
  async createUser(userData) {
    const { nombre, email, password, rol } = userData;
    
    try {
      // 1. Validar rol
      if (!VALID_ROLES.includes(rol)) {
        throw new Error(`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`);
      }

      // 2. Cifrar contraseña con bcrypt
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // 3. Insertar usuario en BD
      const result = await query(
        `INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, nombre, email, rol, created_at`,
        [nombre, email.toLowerCase(), hashedPassword, rol]
      );

      const newUser = result.rows[0];
      
      logger.info(`[UserService] Usuario creado exitosamente`, { userId: newUser.id, email: newUser.email, taskId: 'AS-TASK-21' });
      
      return newUser;
    } catch (error) {
      logger.error('[UserService] Error al crear usuario', { error: error.message, taskId: 'AS-TASK-21' });
      throw error;
    }
  }

  /**
   * Verificar contraseña de usuario
   * @param {string} plainPassword - Contraseña en texto plano
   * @param {string} hashedPassword - Contraseña hasheada
   * @returns {Promise<boolean>} - true si coinciden
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error('[UserService] Error al verificar contraseña', { error: error.message, taskId: 'AS-TASK-21' });
      throw new Error('Error al verificar contraseña');
    }
  }

  /**
   * Buscar usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  async findByEmail(email) {
    try {
      const result = await query(
        'SELECT id, nombre, email, password, rol, created_at FROM usuarios WHERE email = $1',
        [email.toLowerCase()]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('[UserService] Error al buscar usuario', { error: error.message, taskId: 'AS-TASK-21' });
      throw new Error('Error al buscar usuario en base de datos');
    }
  }

  /**
   * Validar estructura de datos de usuario
   * @param {Object} userData - Datos a validar
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  validateUserData(userData) {
    const errors = [];
    const { nombre, email, password, rol } = userData;

    // Validar nombre
    if (!nombre || nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push('Email inválido');
    }

    // Validar contraseña
    if (!password || password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    // Validar rol
    if (!rol || !VALID_ROLES.includes(rol)) {
      errors.push(`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * AS-TASK-08: Buscar usuario por ID
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  async findById(userId) {
    try {
      const result = await query(
        'SELECT id, nombre, email, rol, created_at, updated_at FROM usuarios WHERE id = $1',
        [userId]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('[UserService] Error al buscar usuario por ID', { error: error.message, taskId: 'AS-TASK-21' });
      throw new Error('Error al buscar usuario en base de datos');
    }
  }

  /**
   * AS-TASK-08: Actualizar rol de usuario
   * @param {number} userId - ID del usuario
   * @param {string} newRole - Nuevo rol a asignar
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateUserRole(userId, newRole) {
    try {
      // 1. Validar que el rol sea válido
      if (!isValidRole(newRole)) {
        throw new Error(`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`);
      }

      // 2. Verificar que el usuario existe
      const userExists = await this.findById(userId);
      if (!userExists) {
        throw new Error('Usuario no encontrado');
      }

      // 3. Actualizar rol en BD
      const result = await query(
        `UPDATE usuarios 
         SET rol = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, nombre, email, rol, updated_at`,
        [newRole, userId]
      );

      const updatedUser = result.rows[0];
      
      logger.info(`[UserService] Rol actualizado`, { userId: updatedUser.id, newRole: updatedUser.rol, taskId: 'AS-TASK-21' });
      
      return updatedUser;
    } catch (error) {
      logger.error('[UserService] Error al actualizar rol', { error: error.message, taskId: 'AS-TASK-21' });
      throw error;
    }
  }

  /**
   * AS-TASK-08: Obtener rol por defecto
   * @returns {string} - Rol por defecto
   */
  getDefaultRole() {
    return DEFAULT_ROLE;
  }

  /**
   * AS-TASK-08: Obtener todos los roles válidos
   * @returns {Array<string>} - Array de roles válidos
   */
  getValidRoles() {
    return VALID_ROLES;
  }
}

// Exportar instancia única (Singleton pattern)
module.exports = new UserService();

