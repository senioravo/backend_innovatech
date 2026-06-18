import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';
import userRepository from '../repositories/userRepository.js';
import { DEFAULT_ROLE, getAllRoles } from '../config/roles.js';
import { ValidationError, NotFoundError } from '../utils/errorHandler.js';
import {
  createUserDto,
  updateUserDto,
  validateUserData
} from '../dtos/userDto.js';

const SALT_ROUNDS = 10;
const VALID_ROLES = getAllRoles();

class UserService {
  getDefaultRole() {
    return DEFAULT_ROLE;
  }

  async createUser(body: Record<string, unknown>) {
    const userData = createUserDto(body);

    if (!userData.rol) {
      userData.rol = this.getDefaultRole();
    }

    if (!userData.nombre || !userData.email || !userData.password) {
      throw new ValidationError(['Campos obligatorios faltantes: nombre, email, password']);
    }

    const validation = validateUserData(userData, { requirePassword: true });
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    if (!VALID_ROLES.includes(userData.rol)) {
      throw new ValidationError([`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`]);
    }

    if (await userRepository.emailExists(userData.email)) {
      throw new ValidationError(['El email ya está registrado en el sistema']);
    }

    try {
      const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const newUser = await userRepository.create({
        nombre: userData.nombre,
        email: userData.email,
        passwordHash,
        rol: userData.rol
      });

      logger.info('[UserService] Usuario creado exitosamente', {
        userId: newUser.id,
        email: newUser.email
      });

      return newUser;
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === '23505') {
        throw new ValidationError(['El email ya está registrado en el sistema']);
      }
      logger.error('[UserService] Error al crear usuario', { error: err.message });
      throw error;
    }
  }

  async getUserById(id: number) {
    if (isNaN(id)) {
      throw new ValidationError(['ID de usuario inválido']);
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError();
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError();
    }
    return user;
  }

  async findByEmailWithPassword(email: string) {
    return userRepository.findByEmailWithPassword(email);
  }

  async listUsers(options: Record<string, unknown> = {}) {
    return userRepository.findAll(options as {
      page?: number;
      limit?: number;
      rol?: string | null;
      search?: string | null;
    });
  }

  async updateUser(id: number, body: Record<string, unknown>) {
    if (isNaN(id)) {
      throw new ValidationError(['ID de usuario inválido']);
    }

    const updates = updateUserDto(body);
    if (Object.keys(updates).length === 0) {
      throw new ValidationError(['No hay campos para actualizar']);
    }

    const validation = validateUserData(updates, { partial: true });
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    const dbFields: Record<string, unknown> = { ...updates };

    if (updates.password) {
      dbFields.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
    }

    if (updates.rol && !VALID_ROLES.includes(updates.rol)) {
      throw new ValidationError([`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`]);
    }

    try {
      const updatedUser = await userRepository.update(id, dbFields);
      if (!updatedUser) {
        throw new NotFoundError();
      }

      logger.info('[UserService] Usuario actualizado', { userId: id });
      return updatedUser;
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === '23505') {
        throw new ValidationError(['El email ya está en uso por otro usuario']);
      }
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('[UserService] Error al actualizar usuario', { error: err.message, userId: id });
      throw error;
    }
  }

  async deleteUser(id: number) {
    if (isNaN(id)) {
      throw new ValidationError(['ID de usuario inválido']);
    }

    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError();
    }

    logger.info('[UserService] Usuario eliminado', { userId: id });
    return true;
  }

  async changeUserRole(id: number, newRol: string) {
    if (isNaN(id)) {
      throw new ValidationError(['ID de usuario inválido']);
    }

    if (!newRol) {
      throw new ValidationError(['El campo rol es obligatorio']);
    }

    if (!VALID_ROLES.includes(newRol)) {
      throw new ValidationError([`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`]);
    }

    const updatedUser = await userRepository.updateRole(id, newRol);
    if (!updatedUser) {
      throw new NotFoundError();
    }

    logger.info('[UserService] Rol de usuario actualizado', { userId: id, newRol });
    return updatedUser;
  }
}

export default new UserService();
