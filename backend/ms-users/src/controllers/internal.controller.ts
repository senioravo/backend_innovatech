import userService from '../services/user.service.js';
import logger from '../utils/logger.js';
import { errorResponseDto } from '../dtos/userDto.js';

const getUserByEmailWithPassword = async (req, res) => {
  try {
    const { email } = req.params;
    const serviceId = req.internalService?.id || 'unknown';

    logger.info(`[INTERNAL-CONTROLLER] Solicitud interna de usuario por email - Email: ${email} - Servicio: ${serviceId}`);

    if (!email) {
      return res.status(400).json(
        errorResponseDto('Email es requerido')
      );
    }

    const user = await userService.findByEmail(email);

    if (!user) {
      logger.info(`[INTERNAL-CONTROLLER] Usuario no encontrado - Email: ${email}`);
      return res.status(404).json(
        errorResponseDto('Usuario no encontrado')
      );
    }

    logger.info(`[INTERNAL-CONTROLLER] Usuario encontrado - ID: ${user.id} - Email: ${email}`);

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
    const err = error as Error;
    logger.error('[INTERNAL-CONTROLLER] Error al buscar usuario por email', {
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json(
      errorResponseDto('Error al buscar usuario')
    );
  }
};

const createUserInternal = async (req, res) => {
  try {
    const userData = req.body;
    const serviceId = req.internalService?.id || 'unknown';

    logger.info(`[INTERNAL-CONTROLLER] Solicitud interna de creación de usuario - Email: ${userData.email} - Servicio: ${serviceId}`);

    if (!userData.nombre || !userData.email || !userData.password) {
      return res.status(400).json(
        errorResponseDto('Campos obligatorios faltantes: nombre, email, password')
      );
    }

    const emailExists = await userService.emailExists(userData.email);
    if (emailExists) {
      return res.status(400).json(
        errorResponseDto('El email ya está registrado')
      );
    }

    const newUser = await userService.createUser(userData);

    logger.info(`[INTERNAL-CONTROLLER] Usuario creado exitosamente desde servicio interno - ID: ${newUser.id}`);

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
    const err = error as Error;
    logger.error('[INTERNAL-CONTROLLER] Error al crear usuario desde servicio interno', {
      error: err.message
    });

    return res.status(500).json(
      errorResponseDto('Error al crear usuario')
    );
  }
};

export {
  getUserByEmailWithPassword,
  createUserInternal
};
