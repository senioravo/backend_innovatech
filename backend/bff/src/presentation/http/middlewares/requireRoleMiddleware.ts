/**
 * BFF-TASK-07: Autorización por rol (mismos nombres que Project-manager).
 * Middleware factory que restringe el acceso a roles permitidos (comparación case-insensitive).
 */

/**
 * Crea un middleware Express que exige uno de los roles indicados.
 * @param {...string} allowedRoles - Roles permitidos para acceder al recurso (ej. `directivo`, `gestor`).
 * @returns {import('express').RequestHandler} Middleware que responde 403 si el rol no está autorizado.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        error: 'User has no role assigned'
      });
    }

    const userNorm = String(userRole).trim().toLowerCase();
    const allowed = allowedRoles.map((r) => String(r).trim().toLowerCase());
    if (!allowed.includes(userNorm)) {
      return res.status(403).json({
        error: `Forbidden. Allowed roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

export default requireRole;
