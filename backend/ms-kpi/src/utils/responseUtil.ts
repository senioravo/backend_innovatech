/**
 * Utilidades de respuesta HTTP y manejo global de errores para ms-kpi.
 */
const { ApplicationError } = require('./errorHandler');
const { captureException } = require('../observability/glitchtip');

/**
 * Responde 404 cuando la ruta solicitada no existe en el servicio.
 * @param {import('express').Request} req - Request Express entrante.
 * @param {import('express').Response} res - Response Express donde se serializa el error.
 * @returns {import('express').Response} Response con JSON `{ error: 'Route not found' }`.
 */
function handleNotFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

/**
 * Manejador global de errores: ApplicationError → status correspondiente; resto → 500 con reporte a GlitchTip.
 * @param {Error & { status?: number }} err - Error capturado en la cadena de middlewares.
 * @param {import('express').Request} req - Request que provocó el error.
 * @param {import('express').Response} res - Response donde se escribe el cuerpo de error.
 * @param {import('express').NextFunction} next - Next de Express (requerido por la firma de error handler).
 * @returns {import('express').Response|void} Response JSON con el error o void tras enviar.
 */
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
