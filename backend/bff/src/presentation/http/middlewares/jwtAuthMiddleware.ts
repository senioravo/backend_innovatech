/**
 * Middleware de autenticación JWT para el BFF detrás de KrakenD.
 * Acepta identidad propagada por headers del gateway o verifica Bearer RS256 localmente.
 */
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { asAuthPayload } from '../../../types/authJwtPayload.js';

const publicKeyPath = path.join(process.cwd(), 'keys', 'public.key');

/** @type {string|null} Clave pública RSA en caché para evitar lecturas repetidas del disco. */
let cachedPublicKey: string | null = null;

/**
 * Carga la clave pública RSA desde disco (con caché en memoria).
 * @returns {string} Contenido PEM de la clave pública.
 */
function loadPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;
  cachedPublicKey = fs.readFileSync(publicKeyPath, 'utf8');
  return cachedPublicKey;
}

/**
 * Obtiene el valor de un header HTTP como string (primer elemento si es array).
 * @param {import('express').Request} req - Request Express entrante.
 * @param {string} name - Nombre del header (case-insensitive en Express).
 * @returns {string|undefined} Valor del header o undefined si no está presente.
 */
function headerValue(req, name) {
  const v = req.headers[name];
  if (v == null) return undefined;
  return Array.isArray(v) ? String(v[0]) : String(v);
}

/**
 * Construye el usuario autenticado a partir de headers propagados por el API Gateway.
 * @param {import('express').Request} req - Request con headers X-User-* o aliases legacy (id, email, rol).
 * @returns {{ id: string; email: string; role: string }|null} Usuario resuelto o null si faltan datos obligatorios.
 */
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

/**
 * Verifica un token Bearer JWT RS256 y extrae la identidad del payload.
 * @param {import('express').Request} req - Request con header Authorization Bearer.
 * @returns {{ id: string; email: string; role: string }|null} Usuario autenticado o null si el token es inválido.
 */
function userFromBearerToken(req) {
  const authHeader = headerValue(req, 'authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.slice(7);
    const decoded = asAuthPayload(
      jwt.verify(token, loadPublicKey(), {
        algorithms: ['RS256'],
        issuer: process.env.JWT_ISSUER || 'innovatech-auth'
      })
    );
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
 * @param {import('express').Request} req - Request Express entrante.
 * @param {import('express').Response} res - Response Express para responder 401 si no hay identidad.
 * @param {import('express').NextFunction} next - Callback para continuar la cadena de middlewares.
 * @returns {void|import('express').Response} Continúa con `next()` o responde 401 Unauthorized.
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
