const jwt = require('jsonwebtoken');
const config = require('../../../config');

/**
 * BFF-TASK-06: Valida JWT (mismo secreto que emite Auth) y rellena req.user.
 */
function jwtAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or invalid Authorization header (Bearer token required)'
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = jwtAuthMiddleware;
