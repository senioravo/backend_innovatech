/**
 * Utilidad para verificar y decodificar tokens JWT RS256 emitidos por ms-auth.
 */
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { __dirname } from './esm-path.js';

class JWTHelper {
  issuer: string;
  algorithm: string;
  publicKey: string | null;
  private _publicKeyPath: string;
  private _keysLoaded = false;

  /** Carga issuer, algoritmo y ruta de la clave pública RSA. */
  constructor() {
    this.issuer = process.env.JWT_ISSUER || 'innovatech-auth';
    this.algorithm = 'RS256';
    this.publicKey = null;
    this._publicKeyPath =
      process.env.JWT_PUBLIC_KEY_PATH || path.join(__dirname, '../../keys/jwt_public.pem');

    if (!fs.existsSync(this._publicKeyPath)) {
      console.warn(
        '[JWT-HELPER] ⚠️ Clave pública RSA no encontrada. Swagger y /health funcionan; endpoints protegidos requieren setup-keys.bat'
      );
    }
  }

  /**
   * Carga la clave pública desde disco si aún no está en memoria.
   * @returns {void}
   * @throws {Error} Si el archivo de clave no puede leerse
   */
  private _ensureKeys() {
    if (this._keysLoaded) {
      return;
    }

    try {
      this.publicKey = fs.readFileSync(this._publicKeyPath, 'utf8');
      this._keysLoaded = true;
      console.log('[JWT-HELPER] ✅ Clave pública RSA cargada');
    } catch (error) {
      const err = error as Error;
      throw new Error(`No se pudo cargar la clave pública RSA: ${err.message}`);
    }
  }

  /**
   * Verifica firma, issuer y expiración del token JWT.
   * @param {string} token - JWT en formato Bearer sin prefijo
   * @returns {string|import('jsonwebtoken').JwtPayload} Payload decodificado
   * @throws {Error} Token no proporcionado, expirado o inválido
   */
  verifyToken(token: string) {
    this._ensureKeys();

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

  /**
   * Decodifica el token sin verificar firma (solo inspección).
   * @param {string} token
   * @returns {string|import('jsonwebtoken').JwtPayload|null} Payload o null si falla
   */
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
