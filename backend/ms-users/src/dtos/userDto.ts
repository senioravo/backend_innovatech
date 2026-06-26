import UserModel from '../models/userModel.js';
import { pickName, pickRole } from '../utils/userRowMapper.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['gestor', 'profesional', 'directivo'];

type UserInput = {
  name?: string | null;
  nombre?: string | null;
  email?: string | null;
  password?: string | null;
  role?: string | null;
  rol?: string | null;
};

type ValidateOptions = {
  requirePassword?: boolean;
  partial?: boolean;
};

function userToDto(user: UserModel | Record<string, unknown> | null) {
  if (!user) return null;

  if (user instanceof UserModel) {
    return user.toSafeObject();
  }

  return {
    id: user.id,
    name: user.name ?? user.nombre,
    email: user.email,
    role: user.role ?? user.rol,
    skills: user.skills ?? user.habilidades ?? '',
    availability: user.availability ?? user.disponibilidad ?? 'disponible',
    weeklyAvailableHours: user.weeklyAvailableHours ?? user.horas_semanales_disponibles ?? 40,
    createdAt: user.createdAt ?? user.created_at,
    updatedAt: user.updatedAt ?? user.updated_at
  };
}

function usersToDto(users) {
  if (!Array.isArray(users)) return [];
  return users.map(userToDto);
}

function createUserDto(body) {
  const name = pickName(body);
  const role = pickRole(body);
  const { email, password } = body ?? {};

  return {
    name: typeof name === 'string' ? name.trim() : null,
    email: typeof email === 'string' ? email.trim().toLowerCase() : null,
    password: typeof password === 'string' ? password : null,
    role: typeof role === 'string' ? role.trim() : null
  };
}

function updateUserDto(body: Record<string, unknown>) {
  const updates: Record<string, string | null> = {};

  const name = pickName(body);
  const role = pickRole(body);

  if (body.name !== undefined || body.nombre !== undefined) {
    updates.name = typeof name === 'string' ? name.trim() : null;
  }
  if (body.email !== undefined) {
    updates.email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null;
  }
  if (body.password !== undefined) {
    updates.password = typeof body.password === 'string' ? body.password : null;
  }
  if (body.role !== undefined || body.rol !== undefined) {
    updates.role = typeof role === 'string' ? role.trim() : null;
  }

  return updates;
}

function successResponseDto(message, data = null) {
  return {
    success: true,
    message,
    data
  };
}

function errorResponseDto(message, details = null) {
  return {
    success: false,
    error: message,
    details
  };
}

function validateUserData(userData: UserInput, options: ValidateOptions = {}) {
  const { requirePassword = false, partial = false } = options;
  const errors = [];
  const name = userData?.name ?? userData?.nombre;
  const role = userData?.role ?? userData?.rol;
  const { email, password } = userData ?? {};

  if (!partial || name !== undefined || userData?.nombre !== undefined || userData?.name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
  }

  if (!partial || email !== undefined) {
    if (!email || !EMAIL_REGEX.test(email)) {
      errors.push('Email inválido');
    }
  }

  if (requirePassword || (partial && password !== undefined)) {
    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
  }

  if (role !== undefined && role !== null && role !== '') {
    if (!VALID_ROLES.includes(role as string)) {
      errors.push('Rol inválido. Valores permitidos: gestor, profesional, directivo');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export {
  userToDto,
  usersToDto,
  createUserDto,
  updateUserDto,
  successResponseDto,
  errorResponseDto,
  validateUserData
};
