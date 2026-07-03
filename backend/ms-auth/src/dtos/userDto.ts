/**
 * DTOs de usuario para ms-auth: entrada, respuesta y validación.
 * Normalizan campos en inglés/español y nunca exponen password en respuestas.
 */

import type UserModel from '../models/userModel.js';

type UserRecord = Record<string, unknown>;
type UserEntityLike = Record<string, unknown> | UserModel;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['gestor', 'profesional', 'directivo'];

/**
 * Normaliza el body de registro (name/nombre, role/rol, email, password).
 * @param {UserRecord} body - Body del request POST /api/auth/register
 * @returns {{ name: string|null; email: string|null; password: string|null; role: string|null }}
 */
export function createRegisterDto(body: UserRecord = {}) {
  const name = body?.name ?? body?.nombre;
  const role = body?.role ?? body?.rol;
  const { email, password } = body;

  return {
    name: typeof name === 'string' ? name.trim() : null,
    email: typeof email === 'string' ? email.trim().toLowerCase() : null,
    password: typeof password === 'string' ? password : null,
    role: typeof role === 'string' ? role.trim() : null
  };
}

/**
 * Normaliza credenciales de login.
 * @param {UserRecord} body - Body del request POST /api/auth/login
 * @returns {{ email: string|null; password: string|null }}
 */
export function createLoginDto(body: UserRecord = {}) {
  const { email, password } = body;

  return {
    email: typeof email === 'string' ? email.trim().toLowerCase() : null,
    password: typeof password === 'string' ? password : null
  };
}

/**
 * Mapea entidad usuario a DTO seguro (sin password).
 * @param {UserRecord|null} user - Registro de usuario desde BD o ms-users
 * @returns {object|null} Usuario serializable para API
 */
export function userToDto(user: UserEntityLike | null) {
  if (!user) return null;

  const u = user as Record<string, unknown>;

  return {
    id: u.id,
    name: u.name ?? u.nombre,
    email: u.email,
    role: u.role ?? u.rol,
    createdAt: u.createdAt || u.created_at,
    updatedAt: u.updatedAt || u.updated_at
  };
}

export function usersToDto(users: unknown) {
  if (!Array.isArray(users)) return [];
  return users.map((user) => userToDto(user as UserRecord));
}

/**
 * Respuesta estándar de login exitoso con JWT.
 * @param {UserRecord} user - Usuario autenticado
 * @param {string} token - JWT RS256 firmado
 */
export function authResponseDto(user: UserEntityLike, token: string) {
  return {
    success: true,
    message: 'Autenticación exitosa',
    data: {
      token,
      user: userToDto(user)
    }
  };
}

export function registerResponseDto(user: UserEntityLike) {
  return {
    success: true,
    message: 'Usuario registrado exitosamente',
    data: {
      user: userToDto(user)
    }
  };
}

export function errorResponseDto(message: string, details: unknown = null) {
  return {
    success: false,
    message,
    data: details
  };
}

/**
 * Valida datos de registro (nombre, email, password, rol opcional).
 * @param {UserRecord} userData - DTO normalizado de createRegisterDto
 * @returns {{ valid: boolean; errors: string[] }}
 */
export function validateUserData(userData: UserRecord = {}) {
  const errors: string[] = [];
  const name = userData?.name ?? userData?.nombre;
  const role = userData?.role ?? userData?.rol;
  const { email, password } = userData;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('Email inválido');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (role && typeof role === 'string' && !VALID_ROLES.includes(role)) {
    errors.push('Rol inválido. Valores permitidos: gestor, profesional, directivo');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateLoginData(credentials: UserRecord = {}) {
  const errors: string[] = [];
  const { email, password } = credentials;

  if (!email || !password) {
    errors.push('Email y contraseña son requeridos');
  }

  if (email && typeof email === 'string' && !EMAIL_REGEX.test(email)) {
    errors.push('Formato de email inválido');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
