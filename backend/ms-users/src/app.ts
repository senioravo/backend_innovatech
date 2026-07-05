import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.routes.js';
import internalRoutes from './routes/internal.routes.js';
import metricsRoutes from './routes/metrics.routes.js';
import logger from './utils/logger.js';
import { buildSwaggerApiGlobs } from './utils/swaggerPaths.js';
import { initGlitchTip, flushGlitchTip, captureException } from './observability/glitchtip.js';
import { requestIdMiddleware } from './observability/requestIdMiddleware.js';
import demoRoutes from './observability/demoRoutes.js';

dotenv.config();
initGlitchTip('ms-users');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MS Users API',
      version: '1.0.0',
      description: 'Documentación del microservicio de usuarios',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: buildSwaggerApiGlobs(__dirname, ['routes']),
});

app.use(express.json());
app.use(cors());
app.use(requestIdMiddleware);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.path}`, { ip: req.ip });
  next();
});

app.use('/api/demo', demoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users/internal', internalRoutes);
app.use('/metrics', metricsRoutes);

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check del microservicio
 *     responses:
 *       200:
 *         description: Servicio operativo
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ms-users',
    requestId: res.getHeader('X-Request-Id'),
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  logger.error('[Global Error Handler]', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });
  captureException(err, `${req.method} ${req.path}`);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    requestId: res.getHeader('X-Request-Id'),
  });
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 Microservicio Users ejecutándose en puerto ${PORT}`);
  console.log(`🚀 Microservicio Users ejecutándose en puerto ${PORT}`);
  console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`🔍 GlitchTip demo: http://localhost:${PORT}/api/demo/health`);
});

async function shutdown(signal: string) {
  console.log(`[ms-users] ${signal} — flushing GlitchTip...`);
  await flushGlitchTip();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
