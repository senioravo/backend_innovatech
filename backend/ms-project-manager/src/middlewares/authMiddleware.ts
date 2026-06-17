// @ts-nocheck
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Cargar clave PÚBLICA RSA para verificar tokens (NO puede firmar)
const publicKeyPath = path.join(__dirname, '..', '..', 'keys', 'public.key');
let publicKey: string;

try {
  publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  console.log('[PM-AUTH-MIDDLEWARE] ✅ Clave pública RSA cargada correctamente');
  console.log('[PM-AUTH-MIDDLEWARE] ℹ️  Este servicio solo puede VERIFICAR tokens, no crearlos');
} catch (error) {
  console.error('[PM-AUTH-MIDDLEWARE] ❌ Error al cargar clave pública RSA:', error.message);
  console.error('[PM-AUTH-MIDDLEWARE] Asegúrate de copiar ms-auth/keys/public.key a ms-project-manager/keys/public.key');
  throw new Error('No se pudo cargar la clave pública RSA');
}

/**
 * Middleware de autenticación para Project Manager
 * Verifica tokens JWT usando clave pública RSA (RS256)
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header (Bearer token required)' });
  }

  const token = authHeader.slice(7);

  try {
    // Verificar token con clave PÚBLICA RSA
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'], // Solo aceptar RS256
      issuer: 'innovatech-auth' // Verificar emisor
    });
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role ?? decoded.rol
    };

    console.log(`[PM-AUTH-MIDDLEWARE] Token RS256 verificado - UserID: ${decoded.id}`);
    next();
  } catch (error) {
    console.warn('[PM-AUTH-MIDDLEWARE] Token inválido o expirado:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export default authMiddleware;;