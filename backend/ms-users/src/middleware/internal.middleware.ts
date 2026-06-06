// @ts-nocheck
export {};
// Middleware para validar llamadas internas entre microservicios
// Responsabilidad: Autenticar comunicación entre ms-auth y ms-users

const logger = require('../utils/logger');

/**
 * Middleware para validar token de servicio interno
 * Solo permite llamadas de otros microservicios autorizados
 */
const validateInternalToken = (req, res, next) => {
  try {
    const internalToken = req.headers['x-internal-token'];
    const serviceId = req.headers['x-internal-service'];
    
    // Token interno configurado en .env
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
    
    // Validar que el servicio esté autorizado
    const allowedServices = ['ms-auth', 'bff']; // Lista de servicios autorizados
    if (!allowedServices.includes(serviceId)) {
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
    
    // Agregar información del servicio al request
    req.internalService = {
      id: serviceId,
      authenticated: true
    };
    
    next();
  } catch (error) {
    logger.error('[INTERNAL-AUTH] Error en validación de token interno', {
      error: error.message
    });
    return res.status(500).json({
      success: false,
      error: 'Error en autenticación de servicio interno'
    });
  }
};

module.exports = { validateInternalToken };
