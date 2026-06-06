// @ts-nocheck
export {};
// Helper para verificación de JWT con clave pública
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class JWTHelper {
  constructor() {
    this.issuer = process.env.JWT_ISSUER || 'innovatech-auth';
    this.algorithm = 'RS256';
    
    // Cargar solo clave pública para VERIFICAR tokens generados por ms-auth
    const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || path.join(__dirname, '../../keys/jwt_public.pem');
    
    try {
      this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
      console.log('[JWT-HELPER] ✅ Clave pública RSA cargada correctamente');
    } catch (error) {
      console.error('[JWT-HELPER] ❌ Error al cargar clave pública RSA:', error.message);
      throw new Error('No se pudo cargar la clave pública RSA. Verifica la configuración.');
    }
  }

  /**
   * Verificar y decodificar un token JWT
   * @param {string} token - Token a verificar
   * @returns {Object} - Payload decodificado
   */
  verifyToken(token) {
    try {
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      // Verificar firma y validez del token con CLAVE PÚBLICA
      const decoded = jwt.verify(token, this.publicKey, {
        issuer: this.issuer,
        algorithms: [this.algorithm]
      });

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      }
      throw error;
    }
  }

  /**
   * Decodificar token sin verificar (solo para debugging)
   * @param {string} token - Token a decodificar
   * @returns {Object} - Payload decodificado
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error('[JWT-HELPER] Error al decodificar token:', error.message);
      return null;
    }
  }
}

const jwtHelper = new JWTHelper();
module.exports = jwtHelper;
