import userService from '../services/user.service.js';
import logger from '../utils/logger.js';
import { ValidationError, NotFoundError } from '../utils/errorHandler.js';
import { errorResponseDto } from '../dtos/userDto.js';

function mapServiceError(error) {
  if (error instanceof ValidationError) {
    const message = error.errors.length === 1
      ? error.errors[0]
      : 'Datos inválidos';
    return {
      status: 400,
      body: errorResponseDto(message, { errors: error.errors })
    };
  }

  if (error instanceof NotFoundError) {
    return {
      status: 404,
      body: errorResponseDto(error.message)
    };
  }

  return null;
}

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
        nombre: user.nombre,
        email: user.email,
        password: user.password,
        rol: user.rol,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    logger.error('[INTERNAL-CONTROLLER] Error al buscar usuario por email', {
      error: error.message
    });
    return res.status(500).json(errorResponseDto('Error al buscar usuario'));
  }
};

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
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    const mapped = mapServiceError(error);
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
