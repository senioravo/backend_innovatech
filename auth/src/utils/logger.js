// AS-TASK-12: Logger Helper para auditoría de accesos y operaciones críticas
// Responsabilidad: Gestión centralizada de logs con escritura en archivos
// Principio SOLID: Single Responsibility - Solo maneja logging y persistencia

const fs = require('fs');
const path = require('path');

/**
 * Clase Logger - Sistema de logging centralizado
 * Características:
 * - Formato estandarizado: [OK]/[ERROR] - Fecha - UsuarioId - Operación - Detalle
 * - Escritura en archivo local (logs/audit.log)
 * - Rotación automática de archivos (max 10MB)
 * - No registra contraseñas ni tokens completos
 * - Incluye taskId en cada registro
 */
class Logger {
  constructor() {
    // Directorio de logs
    this.logsDir = path.join(__dirname, '../../logs');
    this.auditLogFile = path.join(this.logsDir, 'audit.log');
    this.errorLogFile = path.join(this.logsDir, 'error.log');
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    
    // Crear directorio de logs si no existe
    this.ensureLogDirectory();
  }

  /**
   * Crear directorio de logs si no existe
   */
  ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
        console.log('[LOGGER] Directorio de logs creado:', this.logsDir);
      }
    } catch (error) {
      console.error('[LOGGER] Error al crear directorio de logs:', error.message);
    }
  }

  /**
   * Verificar tamaño de archivo y rotar si es necesario
   * @param {string} filePath - Ruta del archivo a verificar
   */
  rotateLogFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        
        if (stats.size > this.maxFileSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const rotatedFile = filePath.replace('.log', `-${timestamp}.log`);
          
          fs.renameSync(filePath, rotatedFile);
          console.log(`[LOGGER] Archivo rotado: ${rotatedFile}`);
        }
      }
    } catch (error) {
      console.error('[LOGGER] Error al rotar archivo:', error.message);
    }
  }

  /**
   * Escribir log en archivo
   * @param {string} filePath - Ruta del archivo
   * @param {string} message - Mensaje a escribir
   */
  writeToFile(filePath, message) {
    try {
      // Rotar archivo si es necesario
      this.rotateLogFile(filePath);
      
      // Agregar nueva línea al archivo
      fs.appendFileSync(filePath, message + '\n', 'utf8');
    } catch (error) {
      console.error('[LOGGER] Error al escribir en archivo:', error.message);
    }
  }

  /**
   * Formatear mensaje de log estandarizado
   * @param {string} status - [OK] o [ERROR]
   * @param {Object} options - Opciones del log
   * @returns {string} - Mensaje formateado
   */
  formatLogMessage(status, options = {}) {
    const {
      userId = 'N/A',
      operation = 'UNKNOWN',
      detail = '',
      email = 'N/A',
      ip = 'N/A',
      taskId = 'AS-TASK-12',
      responseTime = null
    } = options;

    const timestamp = new Date().toISOString();
    const timePart = responseTime ? ` - Tiempo:${responseTime}ms` : '';
    
    return `${status} - ${timestamp} - UserID:${userId} - Operación:${operation} - Email:${email} - IP:${ip} - ${detail}${timePart} - taskId:${taskId}`;
  }

  /**
   * Sanitizar datos sensibles (no registrar contraseñas ni tokens completos)
   * @param {string} value - Valor a sanitizar
   * @returns {string} - Valor sanitizado
   */
  sanitizeSensitiveData(value) {
    if (!value) return 'N/A';
    
    // Si es un token JWT, mostrar solo primeros y últimos 8 caracteres
    if (typeof value === 'string' && value.length > 50) {
      return `${value.substring(0, 8)}...${value.substring(value.length - 8)}`;
    }
    
    return value;
  }

  /**
   * Log de operación exitosa (auditoría)
   * @param {Object} options - Opciones del log
   */
  auditSuccess(options = {}) {
    const message = this.formatLogMessage('[OK]', options);
    
    // Escribir en archivo de auditoría
    this.writeToFile(this.auditLogFile, message);
    
    // También mostrar en consola
    console.log(`[AUDIT] ${message}`);
  }

  /**
   * Log de operación fallida (auditoría)
   * @param {Object} options - Opciones del log
   */
  auditError(options = {}) {
    const message = this.formatLogMessage('[ERROR]', options);
    
    // Escribir en archivo de auditoría y errores
    this.writeToFile(this.auditLogFile, message);
    this.writeToFile(this.errorLogFile, message);
    
    // También mostrar en consola
    console.error(`[AUDIT] ${message}`);
  }

  /**
   * Log de advertencia (operaciones sospechosas o rechazadas)
   * @param {Object} options - Opciones del log
   */
  auditWarning(options = {}) {
    const message = this.formatLogMessage('[WARNING]', options);
    
    // Escribir en archivo de auditoría
    this.writeToFile(this.auditLogFile, message);
    
    // También mostrar en consola
    console.warn(`[AUDIT] ${message}`);
  }

  /**
   * Log de operación crítica (registro, login, logout, cambio de rol, eliminación)
   * @param {string} operation - Nombre de la operación (REGISTER, LOGIN, LOGOUT, ROLE_CHANGE, DELETE_USER)
   * @param {Object} data - Datos de la operación
   */
  logCriticalOperation(operation, data = {}) {
    const {
      success = true,
      userId = null,
      email = null,
      ip = null,
      detail = '',
      error = null,
      responseTime = null,
      taskId = 'AS-TASK-12'
    } = data;

    const options = {
      userId,
      email,
      ip,
      operation,
      detail,
      responseTime,
      taskId
    };

    if (success) {
      this.auditSuccess(options);
    } else {
      options.detail = error ? `${detail} - Error: ${error}` : detail;
      this.auditError(options);
    }
  }

  /**
   * Log de acceso a endpoint protegido
   * @param {Object} req - Request de Express
   * @param {number} responseTime - Tiempo de respuesta en ms
   * @param {number} statusCode - Código de estado HTTP
   */
  logEndpointAccess(req, responseTime, statusCode) {
    const user = req.user || {};
    const status = statusCode < 400 ? '[OK]' : '[ERROR]';
    
    const options = {
      userId: user.id || 'N/A',
      email: user.email || 'N/A',
      operation: `${req.method} ${req.path}`,
      detail: `Status:${statusCode}`,
      ip: req.ip || req.connection?.remoteAddress || 'N/A',
      responseTime,
      taskId: 'AS-TASK-12'
    };

    if (statusCode < 400) {
      this.auditSuccess(options);
    } else {
      this.auditError(options);
    }
  }

  /**
   * Obtener estadísticas de logs
   * @returns {Object} - Estadísticas
   */
  getStats() {
    try {
      const stats = {
        auditLogSize: 0,
        errorLogSize: 0,
        auditLogExists: fs.existsSync(this.auditLogFile),
        errorLogExists: fs.existsSync(this.errorLogFile)
      };

      if (stats.auditLogExists) {
        stats.auditLogSize = fs.statSync(this.auditLogFile).size;
      }

      if (stats.errorLogExists) {
        stats.errorLogSize = fs.statSync(this.errorLogFile).size;
      }

      return stats;
    } catch (error) {
      console.error('[LOGGER] Error al obtener estadísticas:', error.message);
      return null;
    }
  }
}

// Exportar instancia singleton
const logger = new Logger();
module.exports = logger;
