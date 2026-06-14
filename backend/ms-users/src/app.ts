// @ts-nocheck
export {};
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Importar rutas
const userRoutes = require('./routes/user.routes');
const internalRoutes = require('./routes/internal.routes');
const metricsRoutes = require('./routes/metrics.routes');

// Importar logger
const logger = require('./utils/logger');

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
  apis: [
    `${__dirname}/routes/*.ts`,
    `${__dirname}/routes/*.js`,
    `${__dirname}/app.ts`,
    `${__dirname}/app.js`,
  ],
});

// Middlewares básicos
app.use(express.json());
app.use(cors());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Log de requests
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.path}`, { ip: req.ip });
  next();
});

// Configurar rutas con prefijo /api/users
app.use('/api/users', userRoutes);

// Rutas internas (solo para comunicación entre microservicios)
app.use('/api/users/internal', internalRoutes);

// Métricas de Prometheus
app.use('/metrics', metricsRoutes);

// Health check básico
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
    timestamp: new Date().toISOString() 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  logger.error('[Global Error Handler]', { 
    error: err.message, 
    stack: err.stack,
    path: req.path 
  });
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Microservicio Users ejecutándose en puerto ${PORT}`);
  console.log(`🚀 Microservicio Users ejecutándose en puerto ${PORT}`);
});

module.exports = app;
