// @ts-nocheck
export {};
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

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
  apis: [`${__dirname}/routes/*.ts`, `${__dirname}/routes/*.js`],
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// AS-TASK-02: Importar rutas de autenticación para API Gateway
const authRoutes = require('./routes/auth.routes');

// AS-TASK-03: Importar rutas de Circuit Breaker
const circuitBreakerRoutes = require('./routes/circuitBreaker.routes');

// AS-TASK-09: Importar rutas de ejemplo para demostrar middleware de autorización
const exampleRoutes = require('./routes/example.routes');

// JWKS: Endpoint para servir clave pública en formato JWK (para KrakenD)
const jwksRoutes = require('./routes/jwks.routes');

// Configurar rutas
app.use('/api/auth', authRoutes);
app.use('/api/circuit-breaker', circuitBreakerRoutes);
app.use('/api/example', exampleRoutes);
app.use('/', jwksRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Microservicio Auth ejecutándose en puerto ${PORT}`);
});

module.exports = app;


