"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// AS-TASK-06: Helper para gestión de JWT
// Responsabilidad: Generación, verificación y validación de tokens JWT
// Principio SOLID: Single Responsibility - Solo maneja operaciones JWT
const jwt = require('jsonwebtoken');
/**
 * Clase JWTHelper - Gestión centralizada de tokens JWT
 */
class JWTHelper {
    constructor() {
        // Configuración desde variables de entorno
        this.secret = process.env.JWT_SECRET || 'secret_key_default_CHANGE_THIS';
        this.expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        this.issuer = process.env.JWT_ISSUER || 'innovatech-auth';
        this.algorithm = 'HS256'; // Algoritmo de firma
    }
    /**
     * Generar token JWT para un usuario
     * @param {Object} user - Datos del usuario (id, email, rol)
     * @returns {string} - Token JWT firmado
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
                algorithm: this.algorithm
            };
            // Generar y firmar token
            const token = jwt.sign(payload, this.secret, options);
            console.log(`[JWT-HELPER] Token generado - UserID: ${user.id} - Email: ${user.email} - Expira: ${this.expiresIn}`);
            return token;
        }
        catch (error) {
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
            // Verificar firma y validez del token
            const decoded = jwt.verify(token, this.secret, {
                issuer: this.issuer,
                algorithms: [this.algorithm]
            });
            console.log(`[JWT-HELPER] Token verificado - UserID: ${decoded.id}`);
            return decoded;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                console.warn('[JWT-HELPER] Token expirado');
                throw new Error('Token expirado');
            }
            else if (error.name === 'JsonWebTokenError') {
                console.warn('[JWT-HELPER] Token inválido');
                throw new Error('Token inválido');
            }
            else {
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
        }
        catch (error) {
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
