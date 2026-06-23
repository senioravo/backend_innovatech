// @ts-nocheck
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const publicKeyPath = path.join(process.cwd(), 'keys', 'public.key');

let cachedPublicKey: string | null = null;

function loadPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;
  cachedPublicKey = fs.readFileSync(publicKeyPath, 'utf8');
  return cachedPublicKey;
}

function headerValue(req, name) {
  const v = req.headers[name];
  if (v == null) return undefined;
  return Array.isArray(v) ? String(v[0]) : String(v);
}

function userFromGatewayHeaders(req) {
  const userId = headerValue(req, 'x-user-id') ?? headerValue(req, 'id');
  const userEmail = headerValue(req, 'x-user-email') ?? headerValue(req, 'email');
  const userRole = headerValue(req, 'x-user-role') ?? headerValue(req, 'rol');
  if (!userId || !userEmail || !userRole) return null;
  return {
    id: String(userId),
    email: userEmail,
    role: userRole
  };
}

function userFromBearerToken(req) {
  const authHeader = headerValue(req, 'authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, loadPublicKey(), {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER || 'innovatech-auth'
    });
    if (!decoded?.id || !decoded?.email || !(decoded?.role ?? decoded?.rol)) return null;
    return {
      id: String(decoded.id),
      email: String(decoded.email),
      role: String(decoded.role ?? decoded.rol)
    };
  } catch (error) {
    console.warn('[BFF-JWT-MIDDLEWARE] Token Bearer inválido:', error.message);
    return null;
  }
}

/**
 * Autenticación detrás de KrakenD:
 * 1) headers X-User-* propagados por el gateway
 * 2) fallback: verificar Authorization Bearer con la clave pública RSA
 */
function jwtAuthMiddleware(req, res, next) {
  const user = userFromGatewayHeaders(req) ?? userFromBearerToken(req);

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Access through the API Gateway with a valid JWT.'
    });
  }

  req.user = user;
  next();
}

export default jwtAuthMiddleware;
