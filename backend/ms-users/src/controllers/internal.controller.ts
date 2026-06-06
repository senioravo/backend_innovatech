// @ts-nocheck
export {};
// Controlador de endpoints internos - Solo para comunicación entre microservicios
// Responsabilidad: Facilitar operaciones internas entre ms-auth y ms-users

const userService = require('../services/user.service');
const logger = require('../utils/logger');
const { errorResponseDto } = require('../dtos/userDto');

/**
 * GET /api/users/internal/by-email/:email
 * Buscar usuario por email (INCLUYE password para verificación en ms-auth)
 * Este endpoint SOLO debe ser usado por ms-auth durante el proceso de login
 */
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

    // Buscar usuario incluyendo password (para validación de login)
    const user = await userService.findByEmail(email);
    
    if (!user) {
      logger.info(`[INTERNAL-CONTROLLER] Usuario no encontrado - Email: ${email}`);
      return res.status(404).json(
        errorResponseDto('Usuario no encontrado')
      );
    }
    
    logger.info(`[INTERNAL-CONTROLLER] Usuario encontrado - ID: ${user.id} - Email: ${email}`);
    
    // Retornar usuario CON password (solo para uso interno)
    // NOTA: Este endpoint NO debe ser expuesto públicamente
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        password: user.password, // ⚠️ Solo para verificación interna
        rol: user.rol,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    logger.error('[INTERNAL-CONTROLLER] Error al buscar usuario por email', { 
      error: error.message,
      stack: error.stack 
    });
    
    return res.status(500).json(
      errorResponseDto('Error al buscar usuario')
    );
  }
};

/**
 * POST /api/users/internal
 * Crear usuario desde otro microservicio
 * Este endpoint permite a ms-auth crear usuarios si fuera necesario
 */
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

    // Verificar si el email ya existe
    const emailExists = await userService.emailExists(userData.email);
    if (emailExists) {
      return res.status(400).json(
        errorResponseDto('El email ya está registrado')
      );
    }

    // Crear usuario
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
    logger.error('[INTERNAL-CONTROLLER] Error al crear usuario desde servicio interno', { 
      error: error.message 
    });
    
    return res.status(500).json(
      errorResponseDto('Error al crear usuario')
    );
  }
};

module.exports = {
  getUserByEmailWithPassword,
  createUserInternal
};
