export {};
const { ApplicationError, ValidationError, UpstreamError } = require('./errorHandler');

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

  if (err instanceof UpstreamError) {
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

  res.status(500).json({
    error: 'Internal server error'
  });
}

module.exports = { handleNotFound, handleError };
