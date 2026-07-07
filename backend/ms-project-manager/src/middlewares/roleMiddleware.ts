/**
 * Middleware de autorización por rol.
 * Restringe rutas según los roles permitidos declarados en cada endpoint.
 */

/**
 * Factory de middleware que exige uno de los roles indicados.
 * @param {...string} allowedRoles - Roles permitidos (comparación case-insensitive)
 * @returns {import('express').RequestHandler} Middleware Express
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
