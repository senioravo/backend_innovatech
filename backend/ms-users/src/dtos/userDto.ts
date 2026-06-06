// @ts-nocheck
export {};

/**
 * userDto.ts - Data Transfer Objects para Usuario en ms-users
 * Responsable de formateo y validación de datos de usuarios
 */

/**
 * Convierte UserModel a DTO de respuesta (SIN password)
 * @param {Object} user - UserModel o resultado de BD
 * @returns {Object|null} - Usuario sin campos sensibles
 */
function userToDto(user) {
  if (!user) return null;

  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    createdAt: user.created_at || user.createdAt,
    updatedAt: user.updated_at || user.updatedAt
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
 * Valida y limpia datos para creación de usuario
 * @param {Object} body - Request body con datos del usuario
 * @returns {Object} - Datos limpios y validados
 */
function createUserDto(body) {
  const { nombre, email, password, rol } = body;
  
  return {
    nombre: typeof nombre === 'string' ? nombre.trim() : null,
    email: typeof email === 'string' ? email.trim().toLowerCase() : null,
    password: typeof password === 'string' ? password : null,
    rol: typeof rol === 'string' ? rol.trim() : null
  };
}

/**
 * Valida y limpia datos para actualización de usuario
 * @param {Object} body - Request body con datos a actualizar
 * @returns {Object} - Datos limpios
 */
function updateUserDto(body) {
  const updates = {};
  
  if (body.nombre !== undefined) {
    updates.nombre = typeof body.nombre === 'string' ? body.nombre.trim() : null;
  }
  if (body.email !== undefined) {
    updates.email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null;
  }
  if (body.password !== undefined) {
    updates.password = typeof body.password === 'string' ? body.password : null;
  }
  if (body.rol !== undefined) {
    updates.rol = typeof body.rol === 'string' ? body.rol.trim() : null;
  }
  
  return updates;
}

/**
 * Formato de respuesta exitosa
 * @param {string} message - Mensaje de éxito
 * @param {Object} data - Datos de respuesta
 * @returns {Object} - Respuesta formateada
 */
function successResponseDto(message, data = null) {
  return {
    success: true,
    message,
    data
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
    error: message,
    details
  };
}

/**
 * Valida estructura de datos de usuario
 * @param {Object} userData - Datos a validar
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateUserData(userData) {
  const errors = [];
  const { nombre, email, password, rol } = userData;

  // Validar nombre
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Email inválido');
  }

  // Validar password (solo si se proporciona)
  if (password !== undefined && password !== null) {
    if (typeof password !== 'string' || password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
  }

  // Validar rol (si se proporciona)
  if (rol && !['gestor', 'profesional', 'directivo'].includes(rol)) {
    errors.push('Rol inválido. Valores permitidos: gestor, profesional, directivo');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  userToDto,
  usersToDto,
  createUserDto,
  updateUserDto,
  successResponseDto,
  errorResponseDto,
  validateUserData
};
