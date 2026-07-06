/**
 * Errores de aplicación y upstream para ms-kpi.
 * Permite distinguir fallos de negocio/controlados de errores HTTP de servicios externos.
 */

/**
 * Error de aplicación con código HTTP asociado.
 */
class ApplicationError extends Error {
  status: number;

  /**
   * @param {string} message - Mensaje descriptivo del error.
   * @param {number} [status=500] - Código HTTP a devolver al cliente.
   */
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApplicationError';
  }
}

/**
 * Error derivado de una respuesta no exitosa de un servicio upstream.
 */
class UpstreamError extends ApplicationError {
  body: unknown;

  /**
   * @param {number} status - Código HTTP devuelto por el servicio upstream.
   * @param {unknown} body - Cuerpo de la respuesta upstream (JSON o texto).
   */
  constructor(status: number, body: unknown) {
    const payload = body as Record<string, unknown> | null;
    super(typeof payload?.error === 'string' ? payload.error : `Upstream error (${status})`, status);
    this.body = body;
  }
}

module.exports = { ApplicationError, UpstreamError };
