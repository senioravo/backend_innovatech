import { ApplicationError, ValidationError } from './errorHandler.js';
import { captureException } from '../observability/glitchtip.js';

function handleNotFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

function handleError(err, req, res, next) {
  console.error('Error:', err);

  // ValidationError
  if (err instanceof ValidationError) {
    return res.status(err.status).json({
      error: err.message,
      errors: err.errors
    });
  }

  // ApplicationError
  if (err instanceof ApplicationError) {
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