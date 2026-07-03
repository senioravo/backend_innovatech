/**
 * BFF-TASK-07: Autorización por rol (mismos nombres que Project-manager).
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