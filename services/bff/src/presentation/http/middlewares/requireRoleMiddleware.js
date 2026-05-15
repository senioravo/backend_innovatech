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

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Forbidden. Allowed roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = requireRole;
