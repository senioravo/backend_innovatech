/**
 * Middleware de autenticación JWT RS256 para ms-kpi.
 * Verifica Bearer token con clave pública RSA compartida con ms-auth.
 */
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const publicKeyPath = path.join(__dirname, '..', '..', '..', 'keys', 'public.key');
let publicKey;

try {
  publicKey = fs.readFileSync(publicKeyPath, 'utf8');
} catch (error) {
  console.error('[KPI-AUTH] Error al cargar clave pública RSA:', error.message);
  throw new Error('No se pudo cargar la clave pública RSA');
}

/**
 * Middleware JWT RS256 para rutas KPI.
 * Omite autenticación en rutas públicas (/health, /metrics, /api-docs).
 * Verifica Bearer token con clave pública RSA compartida y popula `req.user`.
 * @param {import('express').Request} req - Request Express entrante.
 * @param {import('express').Response} res - Response Express para responder 401 si el token es inválido.
 * @param {import('express').NextFunction} next - Callback para continuar la cadena de middlewares.
 * @returns {void|import('express').Response} Continúa con `next()` o responde 401 Unauthorized.
 */
function authMiddleware(req, res, next) {
  const openPaths = ['/health', '/metrics', '/api-docs', '/api-docs.json'];
  if (openPaths.some((p) => req.path === p || req.path.startsWith(`${p}/`))) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header (Bearer token required)' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: 'innovatech-auth'
    });
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role ?? decoded.rol
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
