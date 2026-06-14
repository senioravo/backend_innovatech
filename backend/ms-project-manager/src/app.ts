// @ts-nocheck
export {};
require('dotenv').config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');
const apiGateway = require('./gateway/apiGateway');
const { getAuthDependencyStatus } = require('./clients/authServiceClient');
const { handleNotFound, handleError } = require('./utils/responseUtil');
const { verifyDatabase } = require('./db/verify');
const { metricsMiddleware, metricsHandler } = require('./metrics/prometheus');

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
  apis: [`${__dirname}/routes/*.ts`, `${__dirname}/app.ts`],
});

app.use(express.json());
app.use(cors());
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
    dependencies: { auth: await getAuthDependencyStatus() }
  });
});

app.use(config.API_GATEWAY_PREFIX, apiGateway);

app.use(handleNotFound);

app.use(handleError);

const PORT = config.PORT;

if (process.env.NODE_ENV !== 'test') {
  verifyDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Project Manager ejecutándose en puerto ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('No se pudo conectar a PostgreSQL:', err.message);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.warn('Proyecto Manager iniciará sin verificación de PostgreSQL:', err.message);
    app.listen(PORT, () => {
      console.log(`🚀 Project Manager ejecutándose en puerto ${PORT}`);
    });
  });

module.exports = app;
