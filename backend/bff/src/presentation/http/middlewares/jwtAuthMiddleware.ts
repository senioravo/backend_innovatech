export {};
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Cargar clave PÚBLICA RSA para verificar tokens (NO puede firmar)
const publicKeyPath = path.join(__dirname, '..', '..', '..', '..', 'keys', 'public.key');
let publicKey: string;

try {
  publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  console.log('[BFF-JWT-MIDDLEWARE] ✅ Clave pública RSA cargada correctamente');
  console.log('[BFF-JWT-MIDDLEWARE] ℹ️  Este servicio solo puede VERIFICAR tokens, no crearlos');
} catch (error) {
  console.error('[BFF-JWT-MIDDLEWARE] ❌ Error al cargar clave pública RSA:', error.message);
  console.error('[BFF-JWT-MIDDLEWARE] Asegúrate de copiar ms-auth/keys/public.key a bff/keys/public.key');
  throw new Error('No se pudo cargar la clave pública RSA');
}

/**
 * BFF-TASK-06: Valida JWT usando clave pública RSA (RS256)
 * 
 * SEGURIDAD MEJORADA:
 * - Ya NO usa JWT_SECRET compartido (simétrico/inseguro)
 * - Usa clave pública RSA para VERIFICAR tokens firmados por ms-auth
 * - Este servicio NO puede crear tokens falsos (no tiene la clave privada)
 * - Solo ms-auth puede firmar tokens (tiene la clave privada)
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
    // Verificar token con clave PÚBLICA RSA
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'], // Solo aceptar RS256
      issuer: 'innovatech-auth' // Verificar emisor
    });
    
    const role = decoded.role ?? decoded.rol;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role
    };
    
    console.log(`[BFF-JWT-MIDDLEWARE] Token RS256 verificado - UserID: ${decoded.id}`);
    next();
  } catch (error) {
    console.warn('[BFF-JWT-MIDDLEWARE] Token inválido o expirado:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = jwtAuthMiddleware;
