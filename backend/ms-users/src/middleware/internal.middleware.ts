import logger from '../utils/logger.js';

const validateInternalToken = (req, res, next) => {
  try {
    const internalToken = req.headers['x-internal-token'];
    const serviceId = req.headers['x-internal-service'];

    const expectedToken = process.env.INTERNAL_SERVICE_TOKEN || 'development-token';

    if (!internalToken || !serviceId) {
      logger.warn('[INTERNAL-AUTH] Llamada interna sin credenciales', {
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({
        success: false,
        error: 'Autenticación de servicio interno requerida'
      });
    }

    if (internalToken !== expectedToken) {
      logger.warn('[INTERNAL-AUTH] Token de servicio interno inválido', {
        serviceId,
        ip: req.ip
      });
      return res.status(403).json({
        success: false,
        error: 'Token de servicio interno inválido'
      });
    }

    const allowedServices = ['ms-auth', 'bff'];
    if (!allowedServices.includes(serviceId as string)) {
      logger.warn('[INTERNAL-AUTH] Servicio no autorizado', {
        serviceId,
        ip: req.ip
      });
      return res.status(403).json({
        success: false,
        error: 'Servicio no autorizado'
      });
    }

    logger.info(`[INTERNAL-AUTH] Llamada interna autorizada - Servicio: ${serviceId}`);

    req.internalService = {
      id: serviceId,
      authenticated: true
    };

    next();
  } catch (error) {
    const err = error as Error;
    logger.error('[INTERNAL-AUTH] Error en validación de token interno', {
      error: err.message
    });
    return res.status(500).json({
      success: false,
      error: 'Error en autenticación de servicio interno'
    });
  }
};

export { validateInternalToken };
