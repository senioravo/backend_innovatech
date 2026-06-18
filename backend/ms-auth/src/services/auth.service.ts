// @ts-nocheck
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
  async register(body) {
    const userData = createRegisterDto(body);

    if (!userData.rol) {
      userData.rol = userService.getDefaultRole();
    }

    if (!userData.nombre || !userData.email || !userData.password) {
      throw new ValidationError(['Campos obligatorios faltantes: nombre, email, password']);
    }

    const validation = validateUserData(userData);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    return usersClient.createUser(userData);
  }

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
      rol: user.rol
    });

    return { user, token, expiresIn: jwtHelper.getConfig().expiresIn };
  }

  logout(token, user) {
    const blacklisted = tokenBlacklistService.addToBlacklist(token, {
      id: user.id,
      email: user.email,
      rol: user.rol
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

  getRoles() {
    return getAllRolesInfo().map((role, index) => ({
      id: index + 1,
      nombre: role.nombre,
      descripcion: role.descripcion,
      permisos: role.permisos
    }));
  }

  getRolesSimple() {
    return getAllRoles();
  }
}

export default new AuthService();
