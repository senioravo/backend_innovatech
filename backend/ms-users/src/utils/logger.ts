// @ts-nocheck
export {};
// Logger Helper con Winston para logs centralizados
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, '../../logs');
    
    const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
      return message;
    });

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
}

const logger = new Logger();
module.exports = logger;
