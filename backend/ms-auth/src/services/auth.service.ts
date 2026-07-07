/**
 * Servicio de dominio de autenticación.
 * Orquesta registro (ms-users), login (JWT), logout (blacklist) y consulta de roles.
 */
import usersClient from '../clients/usersClient.js';
import userService from './user.service.js';
import jwtHelper from '../utils/jwt.helper.js';
import tokenBlacklistService from '../services/token.blacklist.service.js';
import { getAllRolesInfo, getAllRoles } from '../config/roles.js';
import { ValidationError, UnauthorizedError } from '../utils/appError.js';
import {
  createRegisterDto,
  createLoginDto,
  validateUserData,
  validateLoginData
} from '../dtos/userDto.js';

class AuthService {
  /**
   * Registra un usuario nuevo delegando persistencia a ms-users.
   * @param {Record<string, unknown>} body - Body del request (name, email, password, role)
   * @returns {Promise<object>} Usuario creado sin password
   */
  async register(body) {
    const userData = createRegisterDto(body);

    if (!userData.role) {
      userData.role = userService.getDefaultRole();
    }

    if (!userData.name || !userData.email || !userData.password) {
      throw new ValidationError(['Campos obligatorios faltantes: name, email, password']);
    }

    const validation = validateUserData(userData);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    return usersClient.createUser(userData);
  }

  /**
   * Autentica credenciales y emite JWT firmado con RS256.
   * @param {Record<string, unknown>} body - email y password
   * @returns {Promise<{ user: object; token: string; expiresIn: string }>}
   */
  async login(body) {
    const { email, password } = createLoginDto(body);

    const loginValidation = validateLoginData({ email, password });
    if (!loginValidation.valid) {
      throw new ValidationError(loginValidation.errors);
    }

    const user = await usersClient.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedError();
    }

    const isPasswordValid = await userService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError();
    }

    const token = jwtHelper.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { user, token, expiresIn: jwtHelper.getConfig().expiresIn };
  }

  /**
   * Invalida el token JWT agregándolo a la blacklist en memoria.
   * @param {string} token - JWT Bearer completo
   * @param {{ id: number|string; email: string; role: string }} user - Usuario autenticado
   * @returns {{ userId: number|string; email: string; logoutAt: string }}
   */
  logout(token, user) {
    const blacklisted = tokenBlacklistService.addToBlacklist(token, {
      id: user.id,
      email: user.email,
      role: user.role
    });

    if (!blacklisted) {
      throw new Error('Error al invalidar token');
    }

    return {
      userId: user.id,
      email: user.email,
      logoutAt: new Date().toISOString()
    };
  }

  /**
   * Devuelve roles con id, nombre, descripción y permisos.
   * @returns {Array<{ id: number; name: string; description: string; permissions: unknown }>}
   */
  getRoles() {
    return getAllRolesInfo().map((role, index) => ({
      id: index + 1,
      name: role.name ?? role.nombre,
      description: role.description ?? role.descripcion,
      permissions: role.permissions ?? role.permisos
    }));
  }

  /**
   * Devuelve array simple con nombres de roles válidos.
   * @returns {string[]}
   */
  getRolesSimple() {
    return getAllRoles();
  }
}

export default new AuthService();
