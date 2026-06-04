// @ts-nocheck
export {};
// AS-TASK-06: Helper para gestión de JWT con RSA (RS256)
// Responsabilidad: Generación, verificación y validación de tokens JWT
// Principio SOLID: Single Responsibility - Solo maneja operaciones JWT
// SEGURIDAD: Usa criptografía asimétrica (clave privada para firmar, pública para verificar)

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

/**
 * Clase JWTHelper - Gestión centralizada de tokens JWT con RSA
 * Usa RS256 (RSA + SHA256) en lugar de HS256 (HMAC)
 * 
 * Ventajas de RS256:
 * - Solo este servicio puede FIRMAR tokens (tiene la clave privada)
 * - Otros servicios (BFF) solo pueden VERIFICAR (tienen la clave pública)
 * - No se comparte secreto sensible entre servicios
 */
class JWTHelper {
  constructor() {
    // Configuración desde variables de entorno
    this.expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    this.issuer = process.env.JWT_ISSUER || 'innovatech-auth';
    this.algorithm = 'RS256'; // Algoritmo asimétrico con RSA
    
    // Cargar claves RSA
    const keysDir = path.join(__dirname, '..', '..', 'keys');
    const privateKeyPath = path.join(keysDir, 'private.key');
    const publicKeyPath = path.join(keysDir, 'public.key');
    
    try {
      // Clave PRIVADA: solo para este servicio, para FIRMAR tokens
      this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      console.log('[JWT-HELPER] ✅ Clave privada RSA cargada correctamente');
      
      // Clave PÚBLICA: para verificar tokens localmente (opcional)
      this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
      console.log('[JWT-HELPER] ✅ Clave pública RSA cargada correctamente');
    } catch (error) {
      console.error('[JWT-HELPER] ❌ Error al cargar claves RSA:', error.message);
      console.error('[JWT-HELPER] Ejecuta: node scripts/generate-keys.js');
      throw new Error('No se pudieron cargar las claves RSA. Genera las claves primero.');
    }
  }

  /**
   * Generar token JWT para un usuario
   * @param {Object} user - Datos del usuario (id, email, rol)
   * @returns {string} - Token JWT firmado con clave privada RSA
   */
  generateToken(user) {
    try {
      // Validar datos requeridos
      if (!user.id || !user.email || !user.rol) {
        throw new Error('Datos de usuario incompletos para generar JWT');
      }

      // Payload del token
      const payload = {
        id: user.id,
        email: user.email,
        rol: user.rol
      };

      // Opciones de firma
      const options = {
        expiresIn: this.expiresIn,
        issuer: this.issuer,
        algorithm: this.algorithm // RS256
      };

      // Generar y firmar token con CLAVE PRIVADA
      const token = jwt.sign(payload, this.privateKey, options);

      console.log(`[JWT-HELPER] Token RS256 generado - UserID: ${user.id} - Email: ${user.email} - Expira: ${this.expiresIn}`);

      return token;
    } catch (error) {
      console.error('[JWT-HELPER] Error al generar token:', error.message);
      throw new Error('Error al generar token JWT');
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
        algorithms: [this.algorithm] // RS256
      });

      console.log(`[JWT-HELPER] Token RS256 verificado - UserID: ${decoded.id}`);

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.warn('[JWT-HELPER] Token expirado');
        throw new Error('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        console.warn('[JWT-HELPER] Token inválido');
        throw new Error('Token inválido');
      } else {
        console.error('[JWT-HELPER] Error al verificar token:', error.message);
        throw new Error('Error al verificar token');
      }
    }
  }

  /**
   * Decodificar token sin verificar (útil para debugging)
   * ADVERTENCIA: No usar en producción sin verificación
   * @param {string} token - Token a decodificar
   * @returns {Object} - Payload decodificado (sin verificar)
   */
  decodeToken(token) {
    try {
      const decoded = jwt.decode(token, { complete: true });
      return decoded;
    } catch (error) {
      console.error('[JWT-HELPER] Error al decodificar token:', error.message);
      return null;
    }
  }

  /**
   * Validar formato de email
   * @param {string} email - Email a validar
   * @returns {boolean} - true si es válido
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar fortaleza de contraseña
   * @param {string} password - Contraseña a validar
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  validatePassword(password) {
    const errors = [];

    if (!password || password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (password && password.length > 0 && !/[A-Za-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra');
    }

    if (password && password.length > 0 && !/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtener tiempo de expiración en segundos
   * @returns {number} - Segundos hasta expiración
   */
  getExpirationTime() {
    const timeUnit = this.expiresIn.slice(-1); // h, m, s, d
    const timeValue = parseInt(this.expiresIn.slice(0, -1));

    const conversions = {
      's': 1,
      'm': 60,
      'h': 3600,
      'd': 86400
    };

    return timeValue * (conversions[timeUnit] || 3600);
  }

  /**
   * Obtener información de configuración JWT (para logs)
   * @returns {Object} - Configuración actual
   */
  getConfig() {
    return {
      expiresIn: this.expiresIn,
      issuer: this.issuer,
      algorithm: this.algorithm,
      expirationSeconds: this.getExpirationTime()
    };
  }
}

// Exportar instancia única (Singleton pattern)
module.exports = new JWTHelper();

