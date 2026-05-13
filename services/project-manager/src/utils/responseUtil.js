const { ApplicationError, ValidationError } = require('./errorHandler');

function handleNotFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
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
  res.status(500).json({
    error: 'Error interno del servidor'
  });
}

module.exports = { handleNotFound, handleError };
