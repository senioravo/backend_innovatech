/**
 * Handlers globales de errores y rutas no encontradas para ms-auth.
 * Reporta errores 500 a GlitchTip con contexto del request.
 */
import { ApplicationError, ValidationError, UnauthorizedError } from './appError.js';
import { captureException, captureHttpError } from '../observability/glitchtip.js';

/**
 * Responde 404 para rutas no registradas.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function handleNotFound(req, res) {
  captureHttpError(404, 'Route not found', `${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
}

/**
 * Middleware de error Express: mapea ApplicationError a JSON y captura 500 en GlitchTip.
 * @param {unknown} err - Error propagado por next(err)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function handleError(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ValidationError) {
    const message = Array.isArray(err.errors) && err.errors.length === 1 ? err.errors[0] : 'Validation failed';
    captureHttpError(err.status, message, `${req.method} ${req.path}`, { errors: err.errors });
    return res.status(err.status).json({
      success: false,
      message,
      data: { errors: err.errors }
    });
  }

  if (err instanceof UnauthorizedError) {
    captureHttpError(err.status, err.message, `${req.method} ${req.path}`);
    return res.status(err.status).json({
      success: false,
      message: err.message
    });
  }

  if (err instanceof ApplicationError) {
    captureHttpError(err.status, err.message, `${req.method} ${req.path}`);
    return res.status(err.status).json({
      success: false,
      message: err.message
    });
  }

  console.error('[Global Error Handler]', err);
  captureException(err, `${req.method} ${req.path}`);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    data: process.env.NODE_ENV === 'development' ? { detail: err.message } : undefined,
    requestId: res.getHeader('X-Request-Id'),
  });
}

export { handleNotFound, handleError };
