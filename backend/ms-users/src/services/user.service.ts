import bcrypt from 'bcrypt';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';
import { DEFAULT_ROLE, getAllRoles } from '../config/roles.js';

const SALT_ROUNDS = 10;
const VALID_ROLES = getAllRoles();

class UserService {
  async createUser(userData) {
    const { nombre, email, password, rol } = userData;

    try {
      if (!VALID_ROLES.includes(rol)) {
        throw new Error(`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`);
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const result = await query(
        `INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, nombre, email, rol, created_at, updated_at`,
        [nombre, email.toLowerCase(), hashedPassword, rol]
      );

      const newUser = result.rows[0];

      logger.info('[UserService] Usuario creado exitosamente', {
        userId: newUser.id,
        email: newUser.email
      });

      return newUser;
    } catch (error) {
      const err = error as Error & { code?: string };
      logger.error('[UserService] Error al crear usuario', { error: err.message });

      if (err.code === '23505') {
        throw new Error('El email ya está registrado en el sistema');
      }

      throw error;
    }
  }

  async emailExists(email: string) {
    try {
      const result = await query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email.toLowerCase()]
      );
      return result.rows.length > 0;
    } catch (error) {
      const err = error as Error;
      logger.error('[UserService] Error al verificar email', { error: err.message });
      throw new Error('Error al verificar email en base de datos');
    }
  }

  async findById(id: number) {
    try {
      const result = await query(
        'SELECT id, nombre, email, rol, created_at, updated_at FROM usuarios WHERE id = $1',
        [id]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      const err = error as Error;
      logger.error('[UserService] Error al buscar usuario por ID', {
        error: err.message,
        userId: id
      });
      throw new Error('Error al buscar usuario en base de datos');
    }
  }

  async findByEmail(email: string) {
    try {
      const result = await query(
        'SELECT id, nombre, email, rol, created_at, updated_at FROM usuarios WHERE email = $1',
        [email.toLowerCase()]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      const err = error as Error;
      logger.error('[UserService] Error al buscar usuario por email', {
        error: err.message
      });
      throw new Error('Error al buscar usuario en base de datos');
    }
  }

  async findAll(options: Record<string, unknown> = {}) {
    const {
      page = 1,
      limit = 10,
      rol = null,
      search = null
    } = options as { page?: number; limit?: number; rol?: string | null; search?: string | null };

    try {
      const offset = (Number(page) - 1) * Number(limit);
      let queryText = 'SELECT id, nombre, email, rol, created_at, updated_at FROM usuarios';
      let countQueryText = 'SELECT COUNT(*) FROM usuarios';
      const params: unknown[] = [];
      const whereClauses: string[] = [];

      if (rol && VALID_ROLES.includes(rol)) {
        whereClauses.push(`rol = $${params.length + 1}`);
        params.push(rol);
      }

      if (search) {
        whereClauses.push(`(nombre ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }

      if (whereClauses.length > 0) {
        const whereString = ' WHERE ' + whereClauses.join(' AND ');
        queryText += whereString;
        countQueryText += whereString;
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const queryParams = [...params, limit, offset];

      const [usersResult, countResult] = await Promise.all([
        query(queryText, queryParams),
        query(countQueryText, params)
      ]);

      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / Number(limit));

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
      const err = error as Error;
      logger.error('[UserService] Error al listar usuarios', { error: err.message });
      throw new Error('Error al listar usuarios');
    }
  }

  async updateUser(id: number, updates: Record<string, unknown>) {
    try {
      const allowedFields = ['nombre', 'email', 'rol', 'password'];
      const updateFields: string[] = [];
      const params: unknown[] = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (key === 'password') {
            const hashedPassword = await bcrypt.hash(value as string, SALT_ROUNDS);
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

      updateFields.push('updated_at = NOW()');
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
      const err = error as Error & { code?: string };
      logger.error('[UserService] Error al actualizar usuario', {
        error: err.message,
        userId: id
      });

      if (err.code === '23505') {
        throw new Error('El email ya está en uso por otro usuario');
      }

      throw error;
    }
  }

  async deleteUser(id: number) {
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
      const err = error as Error;
      logger.error('[UserService] Error al eliminar usuario', {
        error: err.message,
        userId: id
      });
      throw error;
    }
  }

  async changeUserRole(id: number, newRol: string) {
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
      const err = error as Error;
      logger.error('[UserService] Error al cambiar rol', {
        error: err.message,
        userId: id
      });
      throw error;
    }
  }

  getDefaultRole() {
    return DEFAULT_ROLE;
  }

  validateUserData(userData: Record<string, unknown>) {
    const errors: string[] = [];
    const { nombre, email, password, rol } = userData as {
      nombre?: string;
      email?: string;
      password?: string;
      rol?: string;
    };

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

export default new UserService();
