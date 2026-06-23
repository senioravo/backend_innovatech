"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');
const apiGateway = require('./presentation/gateway/apiGateway');
const { handleNotFound, handleError } = require('./utils/responseUtil');
const app = express();
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'KPI Service API',
            version: '1.0.0',
            description: 'Microservicio de KPIs y progreso de tareas/proyectos'
        },
        servers: [{ url: `http://localhost:${config.PORT}` }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            }
        }
    },
    apis: [`${__dirname}/presentation/routes/*.ts`, `${__dirname}/app.ts`]
});
app.use(express.json());
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'KPI Service'
    });
});
app.use(config.API_GATEWAY_PREFIX, apiGateway);
app.use(handleNotFound);
app.use(handleError);
const PORT = config.PORT;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`KPI Service ejecutándose en puerto ${PORT}`);
    });
}
module.exports = app;
