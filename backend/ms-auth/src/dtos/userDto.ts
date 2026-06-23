// @ts-nocheck
/**
 * userDto.ts - Data Transfer Objects para Usuario
 * 
 * PROPÓSITO:
 * - Transformar datos de entrada (request body) a formato limpio y validado
 * - Transformar entidades (UserModel) a respuestas seguras (sin password)
 * - Centralizar la lógica de formateo y validación
 * 
 * VENTAJAS:
 * 1. Seguridad: Nunca expone el password en las respuestas
 * 2. Validación: Limpia y valida datos de entrada
 * 3. Consistencia: Formato uniforme en todas las respuestas
 * 4. Mantenibilidad: Un solo lugar para cambiar el formato de respuesta
 */

/**
 * Valida y limpia datos para registro de usuario
 * @param {Object} body - Request body con datos del usuario
 * @returns {Object} - Datos limpios y validados
 */
function createRegisterDto(body) {
  const name = body?.name ?? body?.nombre;
  const role = body?.role ?? body?.rol;
  const { email, password } = body ?? {};

  return {
    name: typeof name === 'string' ? name.trim() : null,
    email: typeof email === 'string' ? email.trim().toLowerCase() : null,
    password: typeof password === 'string' ? password : null,
    role: typeof role === 'string' ? role.trim() : null
  };
}

/**
 * Valida y limpia datos para login
 * @param {Object} body - Request body con credenciales
 * @returns {Object} - Credenciales limpias
 */
function createLoginDto(body) {
  const { email, password } = body;
  
  return {
    email: typeof email === 'string' ? email.trim().toLowerCase() : null,
    password: typeof password === 'string' ? password : null
  };
}

/**
 * Convierte UserModel a DTO de respuesta (SIN password)
 * @param {Object} user - UserModel o resultado de BD
 * @returns {Object|null} - Usuario sin campos sensibles
 */
function userToDto(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name ?? user.nombre,
    email: user.email,
    role: user.role ?? user.rol,
    createdAt: user.createdAt || user.created_at,
    updatedAt: user.updatedAt || user.updated_at
  };
}

/**
 * Convierte array de usuarios a DTOs
 * @param {Array} users - Array de UserModel o resultados de BD
 * @returns {Array} - Array de usuarios sin campos sensibles
 */
function usersToDto(users) {
  if (!Array.isArray(users)) return [];
  return users.map(userToDto);
}

/**
 * Formato de respuesta para autenticación exitosa (con token)
 * @param {Object} user - Usuario autenticado
 * @param {string} token - Token JWT generado
 * @returns {Object} - Respuesta de autenticación completa
 */
function authResponseDto(user, token) {
  return {
    success: true,
    message: 'Autenticación exitosa',
    data: {
      token,
      user: userToDto(user)
    }
  };
}

/**
 * Formato de respuesta para registro exitoso
 * @param {Object} user - Usuario recién creado
 * @returns {Object} - Respuesta de registro
 */
function registerResponseDto(user) {
  return {
    success: true,
    message: 'Usuario registrado exitosamente',
    data: {
      user: userToDto(user)
    }
  };
}

/**
 * Formato de respuesta de error
 * @param {string} message - Mensaje de error
 * @param {Object} details - Detalles adicionales del error
 * @returns {Object} - Respuesta de error formateada
 */
function errorResponseDto(message, details = null) {
  return {
    success: false,
    message,
    data: details
  };
}

/**
 * Valida estructura de datos de usuario
 * @param {Object} userData - Datos a validar
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['gestor', 'profesional', 'directivo'];

function validateUserData(userData) {
  const errors = [];
  const name = userData?.name ?? userData?.nombre;
  const role = userData?.role ?? userData?.rol;
  const { email, password } = userData ?? {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('Email inválido');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (role && !VALID_ROLES.includes(role)) {
    errors.push('Rol inválido. Valores permitidos: gestor, profesional, directivo');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateLoginData(credentials) {
  const errors = [];
  const { email, password } = credentials;

  if (!email || !password) {
    errors.push('Email y contraseña son requeridos');
  }

  if (email && !EMAIL_REGEX.test(email)) {
    errors.push('Formato de email inválido');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export {
  createRegisterDto,
  createLoginDto,
  userToDto,
  usersToDto,
  authResponseDto,
  registerResponseDto,
  errorResponseDto,
  validateUserData,
  validateLoginData
};