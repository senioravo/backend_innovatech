/**
 * Controller HTTP de autenticación (register, login, logout, roles, health).
 * Traduce errores de dominio a respuestas JSON y registra operaciones críticas.
 */
import authService from '../services/auth.service.js';
import logger from '../utils/logger.js';
import { recordCriticalOperation } from '../middleware/metricsMiddleware.js';
import { ValidationError, UnauthorizedError } from '../utils/appError.js';
import {
  authResponseDto,
  registerResponseDto,
  errorResponseDto
} from '../dtos/userDto.js';
import { captureHttpError } from '../observability/glitchtip.js';

/**
 * Mapea excepciones del servicio a status HTTP y body DTO.
 * @param {unknown} error - Error lanzado por authService
 * @returns {{ status: number; body: object }|null} Respuesta mapeada o null si no aplica
 */
function mapServiceError(error, context = 'auth-service') {
  if (error instanceof ValidationError) {
    const message = (Array.isArray(error.errors) ? error.errors : []).length === 1
      ? error.errors[0]
      : 'Datos inválidos';
    captureHttpError(400, message, context, { errors: error.errors });
    return {
      status: 400,
      body: errorResponseDto(message, { errors: error.errors })
    };
  }

  if (error instanceof UnauthorizedError) {
    captureHttpError(401, error.message, context);
    return {
      status: 401,
      body: errorResponseDto(error.message)
    };
  }

  if (String(error.message).includes('ya está registrado')) {
    captureHttpError(400, 'El email ya está registrado', context);
    return {
      status: 400,
      body: errorResponseDto('El email ya está registrado')
    };
  }

  return null;
}

/**
 * POST /api/auth/register — Registra un nuevo usuario vía ms-users.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const register = async (req, res) => {
  const startTime = Date.now();

  try {
    const newUser = await authService.register(req.body);
    const responseTime = Date.now() - startTime;

    logger.logCriticalOperation('REGISTER', {
      success: true,
      userId: newUser.id,
      email: newUser.email,
      ip: req.ip,
      detail: `Usuario registrado - Rol: ${newUser.role}`,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    recordCriticalOperation('REGISTER', true);
    return res.status(201).json(registerResponseDto(newUser));
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const mapped = mapServiceError(error, `${req.method} ${req.path}`);

    logger.logCriticalOperation('REGISTER', {
      success: false,
      userId: null,
      email: req.body?.email || 'N/A',
      ip: req.ip,
      detail: 'Error en registro',
      error: error.message,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    recordCriticalOperation('REGISTER', false);

    if (mapped) {
      return res.status(mapped.status).json(mapped.body);
    }

    return res.status(500).json(
      errorResponseDto('Error interno del servidor al registrar usuario', { error: error.message })
    );
  }
};

/**
 * POST /api/auth/login — Valida credenciales y devuelve JWT RS256.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const login = async (req, res) => {
  const startTime = Date.now();

  try {
    const { user, token, expiresIn } = await authService.login(req.body);
    const responseTime = Date.now() - startTime;

    logger.logCriticalOperation('LOGIN', {
      success: true,
      userId: user.id,
      email: user.email,
      ip: req.ip,
      detail: `Login exitoso - Rol: ${user.role} - Expira: ${expiresIn}`,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    recordCriticalOperation('LOGIN', true);
    return res.status(200).json(authResponseDto(user, token));
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const mapped = mapServiceError(error, `${req.method} ${req.path}`);

    logger.logCriticalOperation('LOGIN', {
      success: false,
      userId: null,
      email: req.body?.email || 'N/A',
      ip: req.ip,
      detail: 'Error en login',
      error: error.message,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    recordCriticalOperation('LOGIN', false);

    if (mapped) {
      return res.status(mapped.status).json(mapped.body);
    }

    return res.status(500).json(
      errorResponseDto('Error interno del servidor al iniciar sesión', { error: error.message })
    );
  }
};

/**
 * POST /api/auth/logout — Invalida el token JWT en la blacklist.
 * Requiere middleware de autenticación previo (req.token, req.user).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const logout = async (req, res) => {
  const startTime = Date.now();

  try {
    const data = authService.logout(req.token, req.user);
    const responseTime = Date.now() - startTime;

    logger.logCriticalOperation('LOGOUT', {
      success: true,
      userId: req.user.id,
      email: req.user.email,
      ip: req.ip,
      detail: 'Logout exitoso - Token invalidado',
      responseTime,
      taskId: 'AS-TASK-13'
    });

    recordCriticalOperation('LOGOUT', true);

    return res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente. Token invalidado.',
      taskId: 'AS-TASK-13',
      data
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    logger.logCriticalOperation('LOGOUT', {
      success: false,
      userId: req.user?.id || null,
      email: req.user?.email || 'N/A',
      ip: req.ip,
      detail: 'Error en logout',
      error: error.message,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    recordCriticalOperation('LOGOUT', false);

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al cerrar sesión',
      taskId: 'AS-TASK-07',
      data: { error: error.message }
    });
  }
};

/**
 * GET /api/auth/roles — Lista roles con permisos detallados.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getRoles = async (req, res) => {
  try {
    const roles = authService.getRoles();
    return res.status(200).json({
      success: true,
      message: 'Roles obtenidos exitosamente',
      taskId: 'AS-TASK-08',
      data: roles
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error: error.message,
      taskId: 'AS-TASK-02'
    });
  }
};

/**
 * GET /api/auth/roles/simple — Lista solo nombres de roles disponibles.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getRolesSimple = async (req, res) => {
  try {
    const rolesArray = authService.getRolesSimple();
    return res.status(200).json({
      success: true,
      message: 'Roles disponibles',
      taskId: 'AS-TASK-10',
      data: { roles: rolesArray }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error: error.message,
      taskId: 'AS-TASK-10'
    });
  }
};

/**
 * GET /api/auth/health — Health check del microservicio de auth.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const health = async (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    service: 'Auth Microservice',
    taskId: 'AS-TASK-02',
    timestamp: new Date().toISOString()
  });
};

export { register, login, logout, getRoles, getRolesSimple, health };
