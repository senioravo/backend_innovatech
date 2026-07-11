/**
 * Controller HTTP de usuarios (CRUD, roles, perfil, listado de profesionales).
 * Mapea errores de dominio a DTOs JSON y registra métricas Prometheus.
 */
import userService from '../services/user.service.js';
import logger from '../utils/logger.js';
import { recordCrudOperation } from '../middleware/metricsMiddleware.js';
import { ValidationError, NotFoundError } from '../utils/errorHandler.js';
import {
  userToDto,
  usersToDto,
  successResponseDto,
  errorResponseDto
} from '../dtos/userDto.js';
import { captureHttpError } from '../observability/glitchtip.js';

/**
 * Traduce ValidationError/NotFoundError a status y body DTO.
 * @param {unknown} error
 * @returns {{ status: number; body: object }|null}
 */
function mapServiceError(error, context = 'ms-users') {
  if (error instanceof ValidationError) {
    const message = error.errors.length === 1
      ? error.errors[0]
      : 'Datos de usuario inválidos';
    captureHttpError(400, message, context, { errors: error.errors });
    return {
      status: 400,
      body: errorResponseDto(message, { errors: error.errors })
    };
  }

  if (error instanceof NotFoundError) {
    captureHttpError(404, error.message, context);
    return {
      status: 404,
      body: errorResponseDto(error.message)
    };
  }

  return null;
}

/** POST /api/users — Crea usuario */
const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    recordCrudOperation('create', 'success');
    return res.status(201).json(
      successResponseDto('Usuario creado exitosamente', { user: userToDto(newUser) })
    );
  } catch (error) {
    const mapped = mapServiceError(error, `${req.method} ${req.path}`);
    recordCrudOperation('create', 'error');
    logger.error('[USER-CONTROLLER] Error al crear usuario', { error: error.message });

    if (mapped) {
      return res.status(mapped.status).json(mapped.body);
    }

    return res.status(500).json(errorResponseDto(error.message || 'Error al crear usuario'));
  }
};

/** GET /api/users/:id — Obtiene usuario por id */
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id));
    recordCrudOperation('read', 'success');
    return res.status(200).json(
      successResponseDto('Usuario encontrado', { user: userToDto(user) })
    );
  } catch (error) {
    const mapped = mapServiceError(error, `${req.method} ${req.path}`);
    recordCrudOperation('read', 'error');
    logger.error('[USER-CONTROLLER] Error al obtener usuario', { error: error.message });

    if (mapped) {
      return res.status(mapped.status).json(mapped.body);
    }

    return res.status(500).json(errorResponseDto('Error al obtener usuario'));
  }
};

/** GET /api/users — Lista paginada con filtros rol y search */
const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, rol = null, search = null } = req.query;
    const result = await userService.listUsers({
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      rol,
      search
    });

    recordCrudOperation('read', 'success');
    return res.status(200).json(
      successResponseDto('Usuarios obtenidos exitosamente', {
        users: usersToDto(result.users),
        pagination: result.pagination
      })
    );
  } catch (error) {
    recordCrudOperation('read', 'error');
    logger.error('[USER-CONTROLLER] Error al listar usuarios', { error: error.message });
    return res.status(500).json(errorResponseDto('Error al listar usuarios'));
  }
};

/** PUT /api/users/:id — Actualiza campos del usuario */
const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(parseInt(req.params.id), req.body);
    recordCrudOperation('update', 'success');
    return res.status(200).json(
      successResponseDto('Usuario actualizado exitosamente', { user: userToDto(updatedUser) })
    );
  } catch (error) {
    const mapped = mapServiceError(error, `${req.method} ${req.path}`);
    recordCrudOperation('update', 'error');
    logger.error('[USER-CONTROLLER] Error al actualizar usuario', { error: error.message });

    if (mapped) {
      return res.status(mapped.status).json(mapped.body);
    }

    return res.status(500).json(errorResponseDto(error.message || 'Error al actualizar usuario'));
  }
};

/** DELETE /api/users/:id — Elimina usuario */
const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(parseInt(req.params.id));
    recordCrudOperation('delete', 'success');
    return res.status(200).json(successResponseDto('Usuario eliminado exitosamente'));
  } catch (error) {
    const mapped = mapServiceError(error, `${req.method} ${req.path}`);
    recordCrudOperation('delete', 'error');
    logger.error('[USER-CONTROLLER] Error al eliminar usuario', { error: error.message });

    if (mapped) {
      return res.status(mapped.status).json(mapped.body);
    }

    return res.status(500).json(errorResponseDto(error.message || 'Error al eliminar usuario'));
  }
};

/** PUT /api/users/:id/rol — Cambia rol del usuario */
const changeUserRole = async (req, res) => {
  try {
    const updatedUser = await userService.changeUserRole(parseInt(req.params.id), req.body.rol);
    recordCrudOperation('update', 'success');
    return res.status(200).json(
      successResponseDto('Rol de usuario actualizado exitosamente', { user: userToDto(updatedUser) })
    );
  } catch (error) {
    const mapped = mapServiceError(error, `${req.method} ${req.path}`);
    recordCrudOperation('update', 'error');
    logger.error('[USER-CONTROLLER] Error al cambiar rol', { error: error.message });

    if (mapped) {
      return res.status(mapped.status).json(mapped.body);
    }

    return res.status(500).json(errorResponseDto(error.message || 'Error al cambiar rol de usuario'));
  }
};

/** GET /api/users/email/:email — Busca por email */
const getUserByEmail = async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.params.email);
    recordCrudOperation('read', 'success');
    return res.status(200).json(
      successResponseDto('Usuario encontrado', { user: userToDto(user) })
    );
  } catch (error) {
    const mapped = mapServiceError(error, `${req.method} ${req.path}`);
    recordCrudOperation('read', 'error');
    logger.error('[USER-CONTROLLER] Error al buscar usuario por email', { error: error.message });

    if (mapped) {
      return res.status(mapped.status).json(mapped.body);
    }

    return res.status(500).json(errorResponseDto('Error al buscar usuario'));
  }
};

/** GET /api/users/professionals — Lista profesionales y gestores */
const listProfessionals = async (req, res) => {
  try {
    const professionals = await userService.listProfessionals();
    recordCrudOperation('read', 'success');
    return res.status(200).json(
      successResponseDto('Profesionales obtenidos', {
        professionals: usersToDto(professionals)
      })
    );
  } catch (error) {
    recordCrudOperation('read', 'error');
    return res.status(500).json(errorResponseDto('Error al listar profesionales'));
  }
};

/** PATCH /api/users/:id/profile — Actualiza perfil profesional */
const updateProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateProfile(parseInt(req.params.id), req.body);
    recordCrudOperation('update', 'success');
    return res.status(200).json(
      successResponseDto('Perfil actualizado', { user: userToDto(updatedUser) })
    );
  } catch (error) {
    const mapped = mapServiceError(error, `${req.method} ${req.path}`);
    recordCrudOperation('update', 'error');
    if (mapped) return res.status(mapped.status).json(mapped.body);
    return res.status(500).json(errorResponseDto(error.message || 'Error al actualizar perfil'));
  }
};

export {
  createUser,
  getUserById,
  listUsers,
  updateUser,
  deleteUser,
  changeUserRole,
  getUserByEmail,
  listProfessionals,
  updateProfile
};
