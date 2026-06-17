import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { __dirname } from './esm-path.js';

class JWTHelper {
  issuer: string;
  algorithm: string;
  publicKey: string;

  constructor() {
    this.issuer = process.env.JWT_ISSUER || 'innovatech-auth';
    this.algorithm = 'RS256';

    const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || path.join(__dirname, '../../keys/jwt_public.pem');

    try {
      this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
      console.log('[JWT-HELPER] ✅ Clave pública RSA cargada correctamente');
    } catch (error) {
      const err = error as Error;
      console.error('[JWT-HELPER] ❌ Error al cargar clave pública RSA:', err.message);
      throw new Error('No se pudo cargar la clave pública RSA. Verifica la configuración.');
    }
  }

  verifyToken(token: string) {
    try {
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      const decoded = jwt.verify(token, this.publicKey, {
        issuer: this.issuer,
        algorithms: [this.algorithm as jwt.Algorithm]
      });

      return decoded;
    } catch (error) {
      const err = error as Error & { name?: string };
      if (err.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      }
      if (err.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      }
      throw error;
    }
  }

  decodeToken(token: string) {
    try {
      return jwt.decode(token);
    } catch (error) {
      const err = error as Error;
      console.error('[JWT-HELPER] Error al decodificar token:', err.message);
      return null;
    }
  }
}

const jwtHelper = new JWTHelper();
export default jwtHelper;
