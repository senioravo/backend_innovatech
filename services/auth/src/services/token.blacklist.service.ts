// @ts-nocheck
export {};
// AS-TASK-07: Servicio de Blacklist de Tokens JWT
// Responsabilidad: Gestionar tokens invalidados (logout)
// Principio SOLID: Single Responsibility - Solo gestiona blacklist

const jwtHelper = require('../utils/jwt.helper');

// AS-TASK-21: Importar Winston logger
const logger = require('../utils/logger');

/**
 * Servicio de Blacklist de Tokens
 * Almacena tokens JWT invalidados en memoria
 */
class TokenBlacklistService {
  constructor() {
    // Set para almacenar tokens en blacklist (en memoria)
    this.blacklist = new Set();
    
    // Map para almacenar metadata adicional
    this.metadata = new Map();
    
    // Limpiar tokens expirados cada 1 hora
    this.startCleanupInterval();
  }

  /**
   * Agregar token a la blacklist
   * @param {string} token - Token JWT a invalidar
   * @param {Object} userInfo - Información del usuario (id, email)
   * @returns {boolean} - true si se agregó exitosamente
   */
  addToBlacklist(token, userInfo = {}) {
    try {
      // Verificar que el token sea válido antes de agregarlo
      const decoded = jwtHelper.verifyToken(token);
      
      // Agregar token a blacklist
      this.blacklist.add(token);
      
      // Guardar metadata
      this.metadata.set(token, {
        userId: decoded.id,
        email: decoded.email,
        rol: decoded.rol,
        blacklistedAt: new Date().toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      });
      
      logger.info(`[BLACKLIST] Token agregado`, { userId: decoded.id, email: decoded.email, expiresAt: new Date(decoded.exp * 1000).toISOString(), taskId: 'AS-TASK-21' });
      
      return true;
    } catch (error) {
      logger.error('[BLACKLIST] Error al agregar token', { error: error.message, taskId: 'AS-TASK-21' });
      
      // Si el token es inválido o expirado, aún lo agregamos
      // para evitar intentos de reutilización
      this.blacklist.add(token);
      this.metadata.set(token, {
        blacklistedAt: new Date().toISOString(),
        error: error.message
      });
      
      return true;
    }
  }

  /**
   * Verificar si un token está en la blacklist
   * @param {string} token - Token a verificar
   * @returns {boolean} - true si está en blacklist
   */
  isBlacklisted(token) {
    return this.blacklist.has(token);
  }

  /**
   * Obtener información de un token en blacklist
   * @param {string} token - Token a consultar
   * @returns {Object|null} - Metadata del token o null
   */
  getBlacklistInfo(token) {
    return this.metadata.get(token) || null;
  }

  /**
   * Eliminar token de blacklist (limpieza)
   * @param {string} token - Token a eliminar
   * @returns {boolean} - true si se eliminó
   */
  removeFromBlacklist(token) {
    const deleted = this.blacklist.delete(token);
    this.metadata.delete(token);
    return deleted;
  }

  /**
   * Limpiar tokens expirados de la blacklist
   * Tokens que ya expiraron naturalmente no necesitan estar en blacklist
   */
  cleanupExpiredTokens() {
    const now = Date.now();
    let cleaned = 0;

    for (const token of this.blacklist) {
      try {
        const info = this.metadata.get(token);
        
        if (info && info.expiresAt) {
          const expirationTime = new Date(info.expiresAt).getTime();
          
          // Si el token ya expiró, eliminarlo de blacklist
          if (expirationTime < now) {
            this.removeFromBlacklist(token);
            cleaned++;
          }
        }
      } catch (error) {
        // Si hay error al procesar, eliminar el token
        this.removeFromBlacklist(token);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`[BLACKLIST] Limpieza automática: ${cleaned} tokens expirados eliminados`, { taskId: 'AS-TASK-21' });
    }

    return cleaned;
  }

  /**
   * Iniciar limpieza automática periódica
   */
  startCleanupInterval() {
    // Limpiar cada 1 hora (3600000 ms)
    const intervalTime = 3600000;
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, intervalTime);

    logger.info('[BLACKLIST] Limpieza automática iniciada (cada 1 hora)', { taskId: 'AS-TASK-21' });
  }

  /**
   * Detener limpieza automática
   */
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      logger.info('[BLACKLIST] Limpieza automática detenida', { taskId: 'AS-TASK-21' });
    }
  }

  /**
   * Obtener estadísticas de la blacklist
   * @returns {Object} - Estadísticas
   */
  getStats() {
    const activeTokens = Array.from(this.blacklist).filter(token => {
      const info = this.metadata.get(token);
      if (!info || !info.expiresAt) return true;
      return new Date(info.expiresAt).getTime() > Date.now();
    }).length;

    return {
      totalBlacklisted: this.blacklist.size,
      activeBlacklisted: activeTokens,
      expiredBlacklisted: this.blacklist.size - activeTokens
    };
  }

  /**
   * Limpiar toda la blacklist (para testing)
   */
  clearAll() {
    const size = this.blacklist.size;
    this.blacklist.clear();
    this.metadata.clear();
    console.log(`[BLACKLIST] Blacklist limpiada completamente - ${size} tokens eliminados`);
    return size;
  }
}

// Exportar instancia única (Singleton pattern)
module.exports = new TokenBlacklistService();

