/**
 * Controller HTTP para endpoints internos (ms-auth, BFF).
 * Expone búsqueda con password y creación de usuarios sin JWT.
 */
import userService from '../services/user.service.js';
import logger from '../utils/logger.js';
import { ValidationError, NotFoundError } from '../utils/errorHandler.js';
import { errorResponseDto } from '../dtos/userDto.js';
import { captureHttpError } from '../observability/glitchtip.js';

/**
 * Traduce ValidationError/NotFoundError a status HTTP y body DTO.
 * @param {unknown} error - Error capturado del servicio
 * @returns {{ status: number; body: object }|null} Mapeo HTTP o null si no es error conocido
 */
function mapServiceError(error, context = 'ms-users-internal') {
  if (error instanceof ValidationError) {
    const message = error.errors.length === 1
      ? error.errors[0]
      : 'Datos inválidos';
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

/**
 * GET interno — Obtiene usuario por email incluyendo password (login ms-auth).
 * @param {import('express').Request} req - params.email; req.internalService opcional
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getUserByEmailWithPassword = async (req, res) => {
  try {
    const { email } = req.params;
    const serviceId = req.internalService?.id || 'unknown';

    logger.info(`[INTERNAL-CONTROLLER] Solicitud interna de usuario por email - Email: ${email} - Servicio: ${serviceId}`);

    if (!email) {
      return res.status(400).json(errorResponseDto('Email es requerido'));
    }

    const user = await userService.findByEmailWithPassword(email);

    if (!user) {
      return res.status(404).json(errorResponseDto('Usuario no encontrado'));
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    logger.error('[INTERNAL-CONTROLLER] Error al buscar usuario por email', {
      error: error.message
    });
    return res.status(500).json(errorResponseDto('Error al buscar usuario'));
  }
};

/**
 * POST interno — Crea usuario desde otro microservicio.
 * @param {import('express').Request} req - body con name, email, password, role
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const createUserInternal = async (req, res) => {
  try {
    const serviceId = req.internalService?.id || 'unknown';
    logger.info(`[INTERNAL-CONTROLLER] Solicitud interna de creación - Email: ${req.body?.email} - Servicio: ${serviceId}`);

    const newUser = await userService.createUser(req.body);

    return res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    const mapped = mapServiceError(error, `${req.method} ${req.path}`);
    logger.error('[INTERNAL-CONTROLLER] Error al crear usuario', { error: error.message });

    if (mapped) {
      return res.status(mapped.status).json(mapped.body);
    }

    return res.status(500).json(errorResponseDto('Error al crear usuario'));
  }
};

export {
  getUserByEmailWithPassword,
  createUserInternal
};
