import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { __dirname } from './esm-path.js';

class Logger {
  logsDir: string;
  winstonLogger: winston.Logger;

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

  info(message: string, meta?: unknown) {
    this.winstonLogger.info(this._formatSimpleMessage(message, meta));
  }

  warn(message: string, meta?: unknown) {
    this.winstonLogger.warn(this._formatSimpleMessage(message, meta));
  }

  error(message: string, meta?: unknown) {
    this.winstonLogger.error(this._formatSimpleMessage(message, meta));
  }

  _formatSimpleMessage(message: string, meta?: unknown) {
    if (meta !== undefined && meta !== null && typeof meta === 'object') {
      return `${String(message)} ${JSON.stringify(meta)}`;
    }
    return message;
  }
}

const logger = new Logger();
export default logger;
