const { ApplicationError } = require('./errorHandler');
const { captureException } = require('../observability/glitchtip');

function handleNotFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

function handleError(err, req, res, next) {
  console.error('[ms-kpi]', err);

  if (err instanceof ApplicationError) {
    return res.status(err.status).json({ error: err.message });
  }

  captureException(err, `${req.method} ${req.path}`);
  res.status(500).json({
    error: 'Internal server error',
    requestId: res.getHeader('X-Request-Id'),
  });
}

module.exports = { handleNotFound, handleError };
