/**
 * Handlers globales de errores y rutas no encontradas para ms-project-manager.
 * Reporta errores 500 a GlitchTip con contexto del request.
 */
import { ApplicationError, ValidationError } from './errorHandler.js';
import { captureException, captureHttpError } from '../observability/glitchtip.js';

/**
 * Responde 404 para rutas no registradas.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function handleNotFound(req, res) {
  captureHttpError(404, 'Route not found', `${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
}

/**
 * Middleware de error Express: mapea ApplicationError a JSON y captura 500 en GlitchTip.
 * @param {unknown} err - Error propagado por next(err)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function handleError(err, req, res, next) {
  console.error('Error:', err);

  // ValidationError
  if (err instanceof ValidationError) {
    captureHttpError(err.status, err.message, `${req.method} ${req.path}`, { errors: err.errors });
    return res.status(err.status).json({
      error: err.message,
      errors: err.errors
    });
  }

  // ApplicationError
  if (err instanceof ApplicationError) {
    captureHttpError(err.status, err.message, `${req.method} ${req.path}`);
    return res.status(err.status).json({
      error: err.message
    });
  }

  // Error genérico
  captureException(err, `${req.method} ${req.path}`);
  res.status(500).json({
    error: 'Internal server error',
    requestId: res.getHeader('X-Request-Id'),
  });
}

export { handleNotFound, handleError };
