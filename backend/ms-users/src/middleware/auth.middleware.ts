// @ts-nocheck
export {};
// Middleware de autenticación para verificar tokens JWT
const jwtHelper = require('../utils/jwt.helper');
const logger = require('../utils/logger');

/**
 * Middleware para verificar token JWT en las peticiones
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const verifyToken = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token no proporcionado',
        message: 'Debes incluir un token de autenticación en el header Authorization' 
      });
    }

    // Extraer token
    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar token
    const decoded = jwtHelper.verifyToken(token);
    
    // Agregar datos del usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };

    logger.info(`[AUTH-MIDDLEWARE] Token verificado - UserID: ${decoded.id} - Email: ${decoded.email}`);
    
    next();
  } catch (error) {
    logger.error('[AUTH-MIDDLEWARE] Error al verificar token', { 
      error: error.message 
    });
    
    if (error.message === 'Token expirado') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'El token ha expirado, por favor inicia sesión nuevamente' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Token inválido',
      message: 'El token proporcionado no es válido' 
    });
  }
};

/**
 * Middleware para verificar que el usuario tenga un rol específico
 * @param {string[]} allowedRoles - Array de roles permitidos
 * @returns {Function} - Middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debes estar autenticado para acceder a este recurso' 
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      logger.warn(`[AUTH-MIDDLEWARE] Acceso denegado - UserID: ${req.user.id} - Rol: ${req.user.rol} - Roles requeridos: ${allowedRoles.join(', ')}`);
      
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: `Este recurso requiere uno de los siguientes roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
