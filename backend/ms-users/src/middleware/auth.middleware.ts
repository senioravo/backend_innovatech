import jwtHelper from '../utils/jwt.helper.js';
import logger from '../utils/logger.js';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token no proporcionado',
        message: 'Debes incluir un token de autenticación en el header Authorization'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwtHelper.verifyToken(token) as unknown as { id: number; email: string; rol: string };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };

    logger.info(`[AUTH-MIDDLEWARE] Token verificado - UserID: ${decoded.id} - Email: ${decoded.email}`);

    next();
  } catch (error) {
    const err = error as Error;
    logger.error('[AUTH-MIDDLEWARE] Error al verificar token', {
      error: err.message
    });

    if (err.message === 'Token expirado') {
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

const requireRole = (allowedRoles: string[]) => {
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

export { verifyToken, requireRole };
