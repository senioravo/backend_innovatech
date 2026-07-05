import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import config from './config/index.js';
import apiGateway from './gateway/apiGateway.js';
import { getAuthDependencyStatus } from './clients/authServiceClient.js';
import { handleNotFound, handleError } from './utils/responseUtil.js';
import { verifyDatabase } from './db/verify.js';
import { metricsMiddleware, metricsHandler } from './metrics/prometheus.js';
import { buildSwaggerApiGlobs } from './utils/swaggerPaths.js';
import { initGlitchTip, flushGlitchTip } from './observability/glitchtip.js';
import { requestIdMiddleware } from './observability/requestIdMiddleware.js';
import demoRoutes from './observability/demoRoutes.js';

initGlitchTip('ms-project-manager');

const app = express();

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project Manager API',
      version: '1.0.0',
      description: 'Documentación del microservicio de gestión de proyectos',
    },
    servers: [{ url: `http://localhost:${config.PORT}` }],
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
app.use(metricsMiddleware);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.get(config.metricsPath, metricsHandler);

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

app.get('/health', async (req, res) => {
  res.json({
    status: 'OK',
    service: 'Project Manager',
    requestId: res.getHeader('X-Request-Id'),
    dependencies: { auth: await getAuthDependencyStatus() }
  });
});

app.use('/api/demo', demoRoutes);
app.use(config.API_GATEWAY_PREFIX, apiGateway);

app.use(handleNotFound);

app.use(handleError);

const PORT = config.PORT;

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Project Manager ejecutándose en puerto ${PORT}`);
    console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`🔍 GlitchTip demo: http://localhost:${PORT}/api/demo/health`);
  });

  async function shutdown(signal: string) {
    console.log(`[ms-project-manager] ${signal} — flushing GlitchTip...`);
    await flushGlitchTip();
    server.close(() => process.exit(0));
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (process.env.NODE_ENV !== 'test') {
  verifyDatabase()
    .then(() => startServer())
    .catch((err) => {
      console.warn('⚠️ Advertencia: Project Manager iniciará sin verificación de PostgreSQL:', err.message);
      startServer();
    });
}

export default app;