// @ts-nocheck
export {};
// Servicio de gestión de usuarios
// Responsabilidad: Lógica de negocio y acceso a datos de usuarios

const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const logger = require('../utils/logger');
const { ROLES, DEFAULT_ROLE, getAllRoles, isValidRole } = require('../config/roles');

const SALT_ROUNDS = 10;
const VALID_ROLES = getAllRoles();

/**
 * Servicio de Usuario - Principios SOLID
 * Single Responsibility: Solo gestiona operaciones de usuarios en BD
 */
class UserService {
  
  /**
   * Crear un nuevo usuario en la BD
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado (sin password)
   */
  async createUser(userData) {
    const { nombre, email, password, rol } = userData;
    
    try {
      // Validar rol
      if (!VALID_ROLES.includes(rol)) {
        throw new Error(`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`);
      }

      // Cifrar contraseña con bcrypt
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Insertar usuario en BD
      const result = await query(
        `INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, nombre, email, rol, created_at, updated_at`,
        [nombre, email.toLowerCase(), hashedPassword, rol]
      );

      const newUser = result.rows[0];
      
      logger.info(`[UserService] Usuario creado exitosamente`, { 
        userId: newUser.id, 
        email: newUser.email 
      });
      
      return newUser;
    } catch (error) {
      logger.error('[UserService] Error al crear usuario', { error: error.message });
      
      // Manejar error de email duplicado
      if (error.code === '23505') {
        throw new Error('El email ya está registrado en el sistema');
      }
      
      throw error;
    }
  }

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
      logger.error('[UserService] Error al verificar email', { error: error.message });
      throw new Error('Error al verificar email en base de datos');
    }
  }

  /**
   * Buscar usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  async findById(id) {
    try {
      const result = await query(
        'SELECT id, nombre, email, rol, created_at, updated_at FROM usuarios WHERE id = $1',
        [id]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('[UserService] Error al buscar usuario por ID', { 
        error: error.message, 
        userId: id 
      });
      throw new Error('Error al buscar usuario en base de datos');
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
        'SELECT id, nombre, email, rol, created_at, updated_at FROM usuarios WHERE email = $1',
        [email.toLowerCase()]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('[UserService] Error al buscar usuario por email', { 
        error: error.message 
      });
      throw new Error('Error al buscar usuario en base de datos');
    }
  }

  /**
   * Listar todos los usuarios con paginación y filtros
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Object>} - { users: [], total: number, page: number, limit: number }
   */
  async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      rol = null,
      search = null 
    } = options;
    
    try {
      const offset = (page - 1) * limit;
      let queryText = 'SELECT id, nombre, email, rol, created_at, updated_at FROM usuarios';
      let countQueryText = 'SELECT COUNT(*) FROM usuarios';
      const params = [];
      const whereClauses = [];

      // Filtro por rol
      if (rol && VALID_ROLES.includes(rol)) {
        whereClauses.push(`rol = $${params.length + 1}`);
        params.push(rol);
      }

      // Búsqueda por nombre o email
      if (search) {
        whereClauses.push(`(nombre ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }

      // Agregar cláusulas WHERE si existen
      if (whereClauses.length > 0) {
        const whereString = ' WHERE ' + whereClauses.join(' AND ');
        queryText += whereString;
        countQueryText += whereString;
      }

      // Ordenar y paginar
      queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const queryParams = [...params, limit, offset];

      // Ejecutar queries
      const [usersResult, countResult] = await Promise.all([
        query(queryText, queryParams),
        query(countQueryText, params)
      ]);

      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      logger.info('[UserService] Usuarios listados', { 
        total, 
        page, 
        limit, 
        totalPages 
      });

      return {
        users: usersResult.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      logger.error('[UserService] Error al listar usuarios', { error: error.message });
      throw new Error('Error al listar usuarios');
    }
  }

  /**
   * Actualizar usuario
   * @param {number} id - ID del usuario
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateUser(id, updates) {
    try {
      const allowedFields = ['nombre', 'email', 'rol', 'password'];
      const updateFields = [];
      const params = [];
      let paramIndex = 1;

      // Construir query dinámica
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          // Si es password, hashear
          if (key === 'password') {
            const hashedPassword = await bcrypt.hash(value, SALT_ROUNDS);
            updateFields.push(`${key} = $${paramIndex++}`);
            params.push(hashedPassword);
          } else {
            updateFields.push(`${key} = $${paramIndex++}`);
            params.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      // Agregar updated_at
      updateFields.push(`updated_at = NOW()`);
      params.push(id);

      const queryText = `
        UPDATE usuarios 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, nombre, email, rol, created_at, updated_at
      `;

      const result = await query(queryText, params);

      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      logger.info('[UserService] Usuario actualizado', { 
        userId: id, 
        fields: Object.keys(updates) 
      });

      return result.rows[0];
    } catch (error) {
      logger.error('[UserService] Error al actualizar usuario', { 
        error: error.message, 
        userId: id 
      });
      
      if (error.code === '23505') {
        throw new Error('El email ya está en uso por otro usuario');
      }
      
      throw error;
    }
  }

  /**
   * Eliminar usuario
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>} - true si se eliminó
   */
  async deleteUser(id) {
    try {
      const result = await query(
        'DELETE FROM usuarios WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      logger.info('[UserService] Usuario eliminado', { userId: id });

      return true;
    } catch (error) {
      logger.error('[UserService] Error al eliminar usuario', { 
        error: error.message, 
        userId: id 
      });
      throw error;
    }
  }

  /**
   * Cambiar rol de usuario
   * @param {number} id - ID del usuario
   * @param {string} newRol - Nuevo rol
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async changeUserRole(id, newRol) {
    try {
      if (!VALID_ROLES.includes(newRol)) {
        throw new Error(`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`);
      }

      const result = await query(
        `UPDATE usuarios 
         SET rol = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, nombre, email, rol, created_at, updated_at`,
        [newRol, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      logger.info('[UserService] Rol de usuario actualizado', { 
        userId: id, 
        newRol 
      });

      return result.rows[0];
    } catch (error) {
      logger.error('[UserService] Error al cambiar rol', { 
        error: error.message, 
        userId: id 
      });
      throw error;
    }
  }

  /**
   * Obtener rol por defecto
   * @returns {string} - Rol por defecto
   */
  getDefaultRole() {
    return DEFAULT_ROLE;
  }

  /**
   * Validar estructura de datos de usuario
   * @param {Object} userData - Datos a validar
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  validateUserData(userData) {
    const errors = [];
    const { nombre, email, password, rol } = userData;

    if (!nombre || nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push('Email inválido');
    }

    if (password && password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (rol && !VALID_ROLES.includes(rol)) {
      errors.push(`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new UserService();
