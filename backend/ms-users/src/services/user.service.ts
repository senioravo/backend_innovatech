/**
 * Servicio de dominio de usuarios (CRUD, roles, perfil profesional).
 * Valida DTOs, hashea passwords y delega persistencia al repositorio.
 */
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
  /** @returns {string} Rol por defecto al crear usuarios sin rol expl?cito */
  getDefaultRole() {
    return DEFAULT_ROLE;
  }

  /**
   * Crea un usuario con password hasheado en PostgreSQL.
   * @param {Record<string, unknown>} body - name, email, password, role
   * @returns {Promise<object>} Usuario creado (sin password)
   * @throws {ValidationError} Si datos inv?lidos o email duplicado
   */
  async createUser(body: Record<string, unknown>) {
    const userData = createUserDto(body);

    if (!userData.role) {
      userData.role = this.getDefaultRole();
    }

    if (!userData.name || !userData.email || !userData.password) {
      throw new ValidationError(['Campos obligatorios faltantes: name, email, password']);
    }

    const validation = validateUserData(userData, { requirePassword: true });
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    if (!VALID_ROLES.includes(userData.role)) {
      throw new ValidationError([`Rol inv?lido. Valores permitidos: ${VALID_ROLES.join(', ')}`]);
    }

    if (await userRepository.emailExists(userData.email)) {
      throw new ValidationError(['El email ya est? registrado en el sistema']);
    }

    try {
      const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const newUser = await userRepository.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role
      });

      logger.info('[UserService] Usuario creado exitosamente', {
        userId: newUser.id,
        email: newUser.email
      });

      return newUser;
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === '23505') {
        throw new ValidationError(['El email ya est? registrado en el sistema']);
      }
      logger.error('[UserService] Error al crear usuario', { error: err.message });
      throw error;
    }
  }

  /**
   * Obtiene un usuario por ID sin incluir password.
   * @param {number} id - Identificador numérico del usuario
   * @returns {Promise<object>} Usuario encontrado
   * @throws {ValidationError} Si el ID no es numérico
   * @throws {NotFoundError} Si el usuario no existe
   */
  async getUserById(id: number) {
    if (isNaN(id)) {
      throw new ValidationError(['ID de usuario inv?lido']);
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError();
    }

    return user;
  }

  /** @param {string} email @throws {NotFoundError} */
  async getUserByEmail(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError();
    }
    return user;
  }

  /** Uso interno ms-auth: incluye hash de password */
  async findByEmailWithPassword(email: string) {
    return userRepository.findByEmailWithPassword(email);
  }

  /** @param {Record<string, unknown>} options - page, limit, rol, search */
  async listUsers(options: Record<string, unknown> = {}) {
    return userRepository.findAll(options as {
      page?: number;
      limit?: number;
      rol?: string | null;
      search?: string | null;
    });
  }

  /**
   * Actualiza campos parciales de un usuario (nombre, email, password, rol).
   * @param {number} id - Identificador del usuario
   * @param {Record<string, unknown>} body - Campos a modificar
   * @returns {Promise<object>} Usuario actualizado (sin password)
   * @throws {ValidationError} Si ID inválido, sin campos o datos incorrectos
   * @throws {NotFoundError} Si el usuario no existe
   */
  async updateUser(id: number, body: Record<string, unknown>) {
    if (isNaN(id)) {
      throw new ValidationError(['ID de usuario inv?lido']);
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
      throw new ValidationError([`Rol inv?lido. Valores permitidos: ${VALID_ROLES.join(', ')}`]);
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
        throw new ValidationError(['El email ya est? en uso por otro usuario']);
      }
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('[UserService] Error al actualizar usuario', { error: err.message, userId: id });
      throw error;
    }
  }

  /**
   * Elimina un usuario por ID.
   * @param {number} id - Identificador del usuario
   * @returns {Promise<boolean>} true si se eliminó correctamente
   * @throws {ValidationError} Si el ID no es numérico
   * @throws {NotFoundError} Si el usuario no existe
   */
  async deleteUser(id: number) {
    if (isNaN(id)) {
      throw new ValidationError(['ID de usuario inv?lido']);
    }

    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError();
    }

    logger.info('[UserService] Usuario eliminado', { userId: id });
    return true;
  }

  /**
   * Cambia el rol de un usuario existente.
   * @param {number} id - Identificador del usuario
   * @param {string} newRol - Nuevo rol (gestor, profesional, directivo)
   * @returns {Promise<object>} Usuario con rol actualizado
   * @throws {ValidationError} Si ID o rol inválidos
   * @throws {NotFoundError} Si el usuario no existe
   */
  async changeUserRole(id: number, newRol: string) {
    if (isNaN(id)) {
      throw new ValidationError(['ID de usuario inv?lido']);
    }

    if (!newRol) {
      throw new ValidationError(['El campo rol es obligatorio']);
    }

    if (!VALID_ROLES.includes(newRol)) {
      throw new ValidationError([`Rol inv?lido. Valores permitidos: ${VALID_ROLES.join(', ')}`]);
    }

    const updatedUser = await userRepository.updateRole(id, newRol);
    if (!updatedUser) {
      throw new NotFoundError();
    }

    logger.info('[UserService] Rol de usuario actualizado', { userId: id, newRol });
    return updatedUser;
  }

  /** Lista profesionales y gestores para asignaci?n de proyectos */
  async listProfessionals() {
    return userRepository.findProfessionals();
  }

  /**
   * Actualiza campos del perfil profesional (habilidades, disponibilidad, horas).
   * @param {number} id - Identificador del usuario
   * @param {Record<string, unknown>} body - habilidades, disponibilidad, horasSemanalesDisponibles
   * @returns {Promise<object>} Usuario con perfil actualizado
   * @throws {ValidationError} Si ID inválido o campos de perfil incorrectos
   * @throws {NotFoundError} Si el usuario no existe
   */
  async updateProfile(id: number, body: Record<string, unknown>) {
    if (isNaN(id)) {
      throw new ValidationError(['ID de usuario inv?lido']);
    }

    const profile: Record<string, unknown> = {};
    if (body.habilidades !== undefined) profile.habilidades = String(body.habilidades).trim();
    if (body.disponibilidad !== undefined) {
      const d = String(body.disponibilidad);
      if (!['disponible', 'ocupado', 'parcial'].includes(d)) {
        throw new ValidationError(['disponibilidad debe ser: disponible, ocupado o parcial']);
      }
      profile.disponibilidad = d;
    }
    if (body.horasSemanalesDisponibles !== undefined) {
      profile.horas_semanales_disponibles = Number(body.horasSemanalesDisponibles);
    }

    if (Object.keys(profile).length === 0) {
      throw new ValidationError(['No hay campos de perfil para actualizar']);
    }

    const updated = await userRepository.updateProfile(id, profile);
    if (!updated) throw new NotFoundError();
    return updated;
  }
}

export default new UserService();
