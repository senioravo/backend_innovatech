/**
 * Logger Winston con rotación diaria de archivos audit y error.
 */
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { __dirname } from './esm-path.js';

class Logger {
  logsDir: string;
  winstonLogger: winston.Logger;

  /** Inicializa transports de archivo rotativo y consola. */
  constructor() {
    this.logsDir = path.join(__dirname, '../../logs');

    const customFormat = winston.format.printf(({ message }) => message as string);

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

    this.winstonLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      transports: [
        auditTransport,
        errorTransport,
        consoleTransport
      ],
      exitOnError: false
    });

    this.winstonLogger.info(`[LOGGER] Winston inicializado - Directorio: ${this.logsDir}`);
  }

  /**
   * Registra mensaje informativo.
   * @param {string} message
   * @param {unknown} [meta] - Metadatos opcionales serializados como JSON
   * @returns {void}
   */
  info(message: string, meta?: unknown) {
    this.winstonLogger.info(this._formatSimpleMessage(message, meta));
  }

  /**
   * Registra advertencia.
   * @param {string} message
   * @param {unknown} [meta]
   * @returns {void}
   */
  warn(message: string, meta?: unknown) {
    this.winstonLogger.warn(this._formatSimpleMessage(message, meta));
  }

  /**
   * Registra error.
   * @param {string} message
   * @param {unknown} [meta]
   * @returns {void}
   */
  error(message: string, meta?: unknown) {
    this.winstonLogger.error(this._formatSimpleMessage(message, meta));
  }

  /**
   * Concatena mensaje con metadatos en una sola línea.
   * @param {string} message
   * @param {unknown} [meta]
   * @returns {string}
   */
  _formatSimpleMessage(message: string, meta?: unknown) {
    if (meta !== undefined && meta !== null && typeof meta === 'object') {
      return `${String(message)} ${JSON.stringify(meta)}`;
    }
    return message;
  }
}

const logger = new Logger();
export default logger;
