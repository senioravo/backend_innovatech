/**
 * Handlers globales de errores del BFF.
 * Traduce ValidationError, ApplicationError y UpstreamError; reporta 500 a GlitchTip.
 */
import { ApplicationError, ValidationError, UpstreamError } from './errorHandler.js';
import { captureException } from '../observability/glitchtip.js';

/**
 * Responde 404 JSON para rutas no montadas en el gateway.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function handleNotFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

/**
 * Middleware de error central del BFF.
 * @param {unknown} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function handleError(err, req, res, next) {
  console.error('Error:', err);

  if (err instanceof ValidationError) {
    return res.status(err.status).json({
      error: err.message,
      errors: err.errors
    });
  }

  if (err instanceof ApplicationError) {
    return res.status(err.status).json({
      error: err.message
    });
  }

  if (err instanceof UpstreamError) {
    if (err.status >= 500) {
      captureException(err, `${req.method} ${req.path} (upstream ${err.status})`);
    }
    if (err.status === 204) {
      return res.status(204).send();
    }
    if (err.data !== undefined && err.data !== null && typeof err.data === 'object') {
      return res.status(err.status).json(err.data);
    }
    if (typeof err.data === 'string') {
      return res.status(err.status).type('text/plain').send(err.data);
    }
    return res.status(err.status).json({ error: err.message });
  }

  captureException(err, `${req.method} ${req.path}`);
  res.status(500).json({
    error: 'Internal server error',
    requestId: res.getHeader('X-Request-Id'),
  });
}

export { handleNotFound, handleError };
