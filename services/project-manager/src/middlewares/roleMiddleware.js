function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        error: 'Usuario sin rol asignado. Solicita acceso al gestor del proyecto.'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `No tienes permisos. Roles permitidos: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = requireRole;
