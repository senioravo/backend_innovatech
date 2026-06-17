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

function updateUserDto(body) {
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

function validateUserData(userData) {
  const errors: string[] = [];
  const { nombre, email, password, rol } = userData;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Email inválido');
  }

  if (password !== undefined && password !== null) {
    if (typeof password !== 'string' || password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
  }

  if (rol && !['gestor', 'profesional', 'directivo'].includes(rol)) {
    errors.push('Rol inválido. Valores permitidos: gestor, profesional, directivo');
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
