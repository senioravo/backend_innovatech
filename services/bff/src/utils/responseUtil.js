const { ApplicationError, ValidationError } = require('./errorHandler');

function handleNotFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

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

  res.status(500).json({
    error: 'Internal server error'
  });
}

module.exports = { handleNotFound, handleError };
