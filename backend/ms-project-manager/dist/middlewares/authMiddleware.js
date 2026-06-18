// @ts-nocheck
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import jwt from 'jsonwebtoken';
import fs from 'fs';
const publicKeyPath = path.join(__dirname, '..', '..', 'keys', 'public.key');
let publicKey = null;
if (!fs.existsSync(publicKeyPath)) {
    console.warn('[PM-AUTH-MIDDLEWARE] ⚠️ Clave pública RSA no encontrada. Swagger y /health funcionan; rutas protegidas requieren public.key');
}
else {
    console.log('[PM-AUTH-MIDDLEWARE] ℹ️  Este servicio solo puede VERIFICAR tokens, no crearlos');
}
function loadPublicKey() {
    if (publicKey) {
        return publicKey;
    }
    publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    console.log('[PM-AUTH-MIDDLEWARE] ✅ Clave pública RSA cargada');
    return publicKey;
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
        const key = loadPublicKey();
        const decoded = jwt.verify(token, key, {
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
    }
    catch (error) {
        if (error.code === 'ENOENT' || error.message?.includes('ENOENT')) {
            return res.status(503).json({ error: 'JWT public key not configured' });
        }
        console.warn('[PM-AUTH-MIDDLEWARE] Token inválido o expirado:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
export default authMiddleware;
;
