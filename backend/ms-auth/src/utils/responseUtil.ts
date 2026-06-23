// @ts-nocheck
import { ApplicationError, ValidationError, UnauthorizedError } from './appError.js';

function handleNotFound(req, res) {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
}

function handleError(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ValidationError) {
    return res.status(err.status).json({
      success: false,
      message: err.errors?.length === 1 ? err.errors[0] : 'Validation failed',
      data: { errors: err.errors }
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(err.status).json({
      success: false,
      message: err.message
    });
  }

  if (err instanceof ApplicationError) {
    return res.status(err.status).json({
      success: false,
      message: err.message
    });
  }

  console.error('[Global Error Handler]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    data: process.env.NODE_ENV === 'development' ? { detail: err.message } : undefined
  });
}

export { handleNotFound, handleError };
