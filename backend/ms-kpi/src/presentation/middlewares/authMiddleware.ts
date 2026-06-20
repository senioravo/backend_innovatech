// @ts-nocheck
export {};
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

function authMiddleware(req, res, next) {
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
