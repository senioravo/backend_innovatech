// @ts-nocheck
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { buildSwaggerApiGlobs } from './utils/swaggerPaths.js';
dotenv.config();
const app = express();

// Middlewares básicos
app.use(express.json());
app.use(cors());

// Configuración Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Microservice API',
      version: '1.0.0',
      description: 'Documentación del microservicio de autenticación',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
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
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// AS-TASK-02: Importar rutas de autenticación para API Gateway
import authRoutes from './routes/auth.routes.js';
import metricsRoutes from './routes/metrics.routes.js';

// AS-TASK-03: Importar rutas de Circuit Breaker
import circuitBreakerRoutes from './routes/circuitBreaker.routes.js';

// AS-TASK-09: Importar rutas de ejemplo para demostrar middleware de autorización
import exampleRoutes from './routes/example.routes.js';

// JWKS: Endpoint para servir clave pública en formato JWK (para KrakenD)
import jwksRoutes from './routes/jwks.routes.js';
import { handleNotFound, handleError } from './utils/responseUtil.js';

// Configurar rutas
app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/circuit-breaker', circuitBreakerRoutes);
app.use('/api/example', exampleRoutes);
app.use('/', jwksRoutes);

app.use(handleNotFound);
app.use(handleError);

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Microservicio Auth ejecutándose en puerto ${PORT}`);
  });
}

export default app;