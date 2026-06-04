// @ts-nocheck
export {};
// Logger Helper con Winston para logs centralizados
// Responsabilidad: Gestión centralizada de logs con Winston + Elasticsearch
// Principio SOLID: Single Responsibility - Solo maneja logging y persistencia

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const { sendAuditToElasticsearch } = require('../clients/elasticAuditClient');

/**
 * Clase Logger - Sistema de logging centralizado con Winston + Elasticsearch
 * Características:
 * - Librería Winston para logging profesional (archivos locales)
 * - Elasticsearch para auditoría centralizada y buscable (opcional)
 * - Formato estandarizado: [OK]/[ERROR] - Fecha - UsuarioId - Operación - Detalle
 * - Rotación automática por fecha (daily) y tamaño (20MB)
 * - Múltiples transportes: consola (desarrollo) + archivos rotativos (producción)
 * - Niveles de log: error, warn, info, http, debug
 * - No registra contraseñas ni tokens completos
 * - Incluye taskId en cada registro
 * - Integración fácil con ELK Stack, CloudWatch, etc.
 */
class Logger {
  constructor() {
    // Directorio de logs
    this.logsDir = path.join(__dirname, '../../logs');
    
    // Formato personalizado que coincida con formato de AS-TASK-12
    const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
      return message;
    });

    // Transporte: Archivo rotativo para auditoría general
    const auditTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        customFormat
      )
    });

    // Transporte: Archivo rotativo solo para errores
    const errorTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        customFormat
      )
    });

    // Transporte: Consola para desarrollo (con colores)
    const consoleTransport = new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      )
    });

    // Crear instancia de Winston
    this.winstonLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      transports: [
        auditTransport,
        errorTransport,
        consoleTransport
      ],
      exitOnError: false
    });

    // Log de inicialización
    this.winstonLogger.info(`[LOGGER] Winston inicializado - Directorio: ${this.logsDir}`);
  }

  /**
   * API estilo Winston: mensaje + metadata opcional (usado por servicios internos).
   */
  info(message, meta) {
    this.winstonLogger.info(this._formatSimpleMessage(message, meta));
  }

  warn(message, meta) {
    this.winstonLogger.warn(this._formatSimpleMessage(message, meta));
  }

  error(message, meta) {
    this.winstonLogger.error(this._formatSimpleMessage(message, meta));
  }

  _formatSimpleMessage(message, meta) {
    if (meta !== undefined && meta !== null && typeof meta === 'object') {
      return `${String(message)} ${JSON.stringify(meta)}`;
    }
    return message;
  }

  /**
   * Formatear mensaje de log estandarizado
   * @param {string} status - [OK], [ERROR], [WARNING]
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
      taskId = 'AS-TASK-13',
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
   * AS-TASK-23: Enviar log de auditoría a Elasticsearch
   * @param {string} level - Nivel del log (success, error, warning)
   * @param {Object} options - Datos del log
   */
  sendToElasticsearch(level, options = {}) {
    const doc = {
      ts: new Date().toISOString(),
      type: 'AUDIT',
      level: level,
      userId: options.userId || 'N/A',
      email: options.email || 'N/A',
      operation: options.operation || 'UNKNOWN',
      detail: options.detail || '',
      ip: options.ip || 'N/A',
      taskId: options.taskId || 'AS-TASK-23',
      responseTime: options.responseTime || null
    };
    
    sendAuditToElasticsearch(doc).catch((err) => {
      // No bloqueamos la ejecución si Elasticsearch falla
      console.error('[audit-es] Failed to index:', err.message);
    });
  }

  /**
   * Log de operación exitosa (auditoría)
   * @param {Object} options - Opciones del log
   */
  auditSuccess(options = {}) {
    const message = this.formatLogMessage('[OK]', options);
    this.winstonLogger.info(message);
    
    // AS-TASK-23: Enviar a Elasticsearch (no bloqueante)
    this.sendToElasticsearch('success', options);
  }

  /**
   * Log de operación fallida (auditoría)
   * @param {Object} options - Opciones del log
   */
  auditError(options = {}) {
    const message = this.formatLogMessage('[ERROR]', options);
    this.winstonLogger.error(message);
    
    // AS-TASK-23: Enviar a Elasticsearch (no bloqueante)
    this.sendToElasticsearch('error', options);
  }

  /**
   * Log de advertencia (operaciones sospechosas o rechazadas)
   * @param {Object} options - Opciones del log
   */
  auditWarning(options = {}) {
    const message = this.formatLogMessage('[WARNING]', options);
    this.winstonLogger.warn(message);
    
    // AS-TASK-23: Enviar a Elasticsearch (no bloqueante)
    this.sendToElasticsearch('warning', options);
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
      taskId = 'AS-TASK-13'
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
      taskId: 'AS-TASK-13'
    };

    if (statusCode < 400) {
      this.auditSuccess(options);
    } else {
      this.auditError(options);
    }
  }

  /**
   * Obtener estadísticas de logs (delegado a Winston)
   * @returns {Object} - Estadísticas
   */
  getStats() {
    try {
      const stats = {
        transports: this.winstonLogger.transports.length,
        level: this.winstonLogger.level,
        logsDir: this.logsDir,
        info: 'Logs manejados por Winston con rotación automática'
      };

      return stats;
    } catch (error) {
      this.winstonLogger.error(`[LOGGER] Error al obtener estadísticas: ${error.message}`);
      return null;
    }
  }

  /**
   * Método adicional: Log de nivel debug para desarrollo
   * @param {string} message - Mensaje de debug
   */
  debug(message) {
    this.winstonLogger.debug(message);
  }

  /**
   * Método adicional: Log de nivel http para requests
   * @param {string} message - Mensaje HTTP
   */
  http(message) {
    this.winstonLogger.http(message);
  }
}

// Exportar instancia singleton
const logger = new Logger();
module.exports = logger;
