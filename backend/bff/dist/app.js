"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
/**
 * Arquitectura en capas (dependencias hacia abajo):
 * - presentation/http → application → infrastructure
 * - config / utils: transversales
 */
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');
const apiGateway = require('./presentation/http/gateway/apiGateway');
const { handleNotFound, handleError } = require('./utils/responseUtil');
const app = express();
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BFF API',
            version: '1.0.0',
            description: 'Documentación del Backend For Frontend de Innovatech',
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
    apis: [`${__dirname}/presentation/http/routes/*.ts`, `${__dirname}/app.ts`],
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
 *     summary: Health check del BFF
 *     responses:
 *       200:
 *         description: Servicio operativo
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'bff'
    });
});
app.use(config.API_GATEWAY_PREFIX, apiGateway);
app.use(handleNotFound);
app.use(handleError);
const PORT = config.PORT;
// Capturar errores no manejados para diagnóstico
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection detectado en BFF:');
    console.error('Razón:', reason);
    console.error('Promise:', promise);
    // No salir inmediatamente para poder ver el error
});
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception detectado en BFF:');
    console.error(error);
    // Dar tiempo para ver el error antes de salir
    setTimeout(() => process.exit(1), 1000);
});
app.listen(PORT, () => {
    console.log(`BFF escuchando en puerto ${PORT}`);
});
module.exports = app;
