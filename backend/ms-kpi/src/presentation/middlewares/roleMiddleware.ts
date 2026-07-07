/**
 * Middleware de autorización por rol para ms-kpi.
 * Restringe el acceso a rutas según el rol del usuario autenticado (comparación case-insensitive).
 */

/**
 * Crea un middleware Express que exige uno de los roles indicados.
 * @param {...string} allowedRoles - Roles permitidos para acceder al recurso.
 * @returns {import('express').RequestHandler} Middleware que responde 403 si el rol no está autorizado.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(403).json({ error: 'User has no role assigned' });
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

module.exports = requireRole;
