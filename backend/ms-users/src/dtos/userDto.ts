const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['gestor', 'profesional', 'directivo'];

type UserInput = {
  nombre?: string | null;
  email?: string | null;
  password?: string | null;
  rol?: string | null;
};

type ValidateOptions = {
  requirePassword?: boolean;
  partial?: boolean;
};

function userToDto(user: Record<string, unknown> | null) {
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

function usersToDto(users) {
  if (!Array.isArray(users)) return [];
  return users.map(userToDto);
}

function createUserDto(body) {
  const { nombre, email, password, rol } = body;

  return {
    nombre: typeof nombre === 'string' ? nombre.trim() : null,
    email: typeof email === 'string' ? email.trim().toLowerCase() : null,
    password: typeof password === 'string' ? password : null,
    rol: typeof rol === 'string' ? rol.trim() : null
  };
}

function updateUserDto(body: Record<string, unknown>) {
  const updates: Record<string, string | null> = {};

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
  const { nombre, email, password, rol } = userData;

  if (!partial || nombre !== undefined) {
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
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

  if (rol !== undefined && rol !== null && rol !== '') {
    if (!VALID_ROLES.includes(rol as string)) {
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
