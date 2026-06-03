// @ts-nocheck
export {};
// AS-TASK-07: Middleware de Autenticación
// Responsabilidad: Extraer y validar tokens JWT del header Authorization
// Principio SOLID: Single Responsibility - Solo valida tokens

const jwtHelper = require('../utils/jwt.helper');
const tokenBlacklistService = require('../services/token.blacklist.service');

// AS-TASK-08: Importar configuración de roles y permisos
const { ROLES, hasPermission } = require('../config/roles');

/**
 * Extraer token del header Authorization
 * Formato esperado: "Bearer <token>"
 * @param {Object} req - Request de Express
 * @returns {string|null} - Token extraído o null
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Verificar formato "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Middleware: Verificar token JWT
 * Valida que el token sea válido y no esté en blacklist
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const verifyToken = (req, res, next) => {
  try {
    // Extraer token del header
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado. Formato: Authorization: Bearer <token>',
        taskId: 'AS-TASK-07'
      });
    }

    // Verificar si el token está en blacklist
    if (tokenBlacklistService.isBlacklisted(token)) {
      const blacklistInfo = tokenBlacklistService.getBlacklistInfo(token);
      
      console.log(`[AUTH-MIDDLEWARE] Token en blacklist rechazado - Invalidado: ${blacklistInfo?.blacklistedAt}`);
      
      return res.status(401).json({
        success: false,
        message: 'Token inválido o sesión cerrada',
        taskId: 'AS-TASK-07'
      });
    }

    // Verificar token con JWT helper
    const decoded = jwtHelper.verifyToken(token);

    // Agregar información del token al request
    req.user = decoded;
    req.token = token;

    console.log(`[AUTH-MIDDLEWARE] Token válido - UserID: ${decoded.id} - Email: ${decoded.email} - Rol: ${decoded.rol}`);

    next();
  } catch (error) {
    console.error('[AUTH-MIDDLEWARE] Error de autenticación:', error.message);

    // Errores específicos de JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        taskId: 'AS-TASK-07'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        taskId: 'AS-TASK-07'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al verificar token',
      error: error.message,
      taskId: 'AS-TASK-07'
    });
  }
};

/**
 * Middleware: Verificar rol del usuario
 * @param {Array<string>} allowedRoles - Roles permitidos
 * @returns {Function} - Middleware function
 */
const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.rol;

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Rol de usuario no encontrado',
          taskId: 'AS-TASK-08'
        });
      }

      if (!allowedRoles.includes(userRole)) {
        console.log(`[AUTH-MIDDLEWARE] Acceso denegado - UserID: ${req.user.id} - Rol: ${userRole} - Requerido: ${allowedRoles.join(', ')}`);
        
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`,
          taskId: 'AS-TASK-08'
        });
      }

      next();
    } catch (error) {
      console.error('[AUTH-MIDDLEWARE] Error al verificar rol:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: error.message,
        taskId: 'AS-TASK-08'
      });
    }
  };
};

/**
 * AS-TASK-08: Middleware de permisos específicos
 * Verifica si el usuario tiene un permiso específico para un módulo y acción
 * @param {string} modulo - Módulo (proyectos, tareas, reportes, usuarios)
 * @param {string} accion - Acción (crear, editar, ver, etc.)
 * @returns {Function} - Middleware function
 */
const requirePermission = (modulo, accion) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.rol;

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Rol de usuario no encontrado',
          taskId: 'AS-TASK-08'
        });
      }

      // Verificar permiso usando la configuración de roles
      if (!hasPermission(userRole, modulo, accion)) {
        console.log(`[AUTH-MIDDLEWARE] Permiso denegado - UserID: ${req.user.id} - Rol: ${userRole} - Módulo: ${modulo} - Acción: ${accion}`);
        
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Su rol "${userRole}" no tiene permiso para "${accion}" en módulo "${modulo}"`,
          taskId: 'AS-TASK-08'
        });
      }

      console.log(`[AUTH-MIDDLEWARE] Permiso concedido - UserID: ${req.user.id} - Rol: ${userRole} - Módulo: ${modulo} - Acción: ${accion}`);
      next();
    } catch (error) {
      console.error('[AUTH-MIDDLEWARE] Error al verificar permisos:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: error.message,
        taskId: 'AS-TASK-08'
      });
    }
  };
};

/**
 * AS-TASK-08: Middleware - Solo GESTOR puede crear/editar proyectos
 * Uso: router.post('/proyectos', verifyToken, requireGestor, createProject)
 */
const requireGestor = (req, res, next) => {
  return verifyRole([ROLES.GESTOR])(req, res, next);
};

/**
 * AS-TASK-08: Middleware - Solo PROFESIONAL puede ver y actualizar tareas asignadas
 * Uso: router.put('/tareas/:id', verifyToken, requireProfesional, updateTask)
 */
const requireProfesional = (req, res, next) => {
  return verifyRole([ROLES.PROFESIONAL])(req, res, next);
};

/**
 * AS-TASK-08: Middleware - Solo DIRECTIVO puede consultar KPIs y reportes
 * Uso: router.get('/reportes', verifyToken, requireDirectivo, getReports)
 */
const requireDirectivo = (req, res, next) => {
  return verifyRole([ROLES.DIRECTIVO])(req, res, next);
};

/**
 * AS-TASK-08: Middleware - Permitir múltiples roles
 * Uso: router.get('/proyectos', verifyToken, allowRoles([ROLES.GESTOR, ROLES.DIRECTIVO]), getProjects)
 */
const allowRoles = (roles) => {
  return verifyRole(roles);
};

module.exports = {
  extractToken,
  verifyToken,
  verifyRole,
  requirePermission,
  requireGestor,
  requireProfesional,
  requireDirectivo,
  allowRoles
};

