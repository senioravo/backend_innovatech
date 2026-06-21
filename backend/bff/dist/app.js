// @ts-nocheck
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import config from './config/index.js';
import apiGateway from './presentation/http/gateway/apiGateway.js';
import { handleNotFound, handleError } from './utils/responseUtil.js';
import { buildSwaggerApiGlobs } from './utils/swaggerPaths.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = config.PORT || 3010;
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BFF API (Backend for Frontend)',
            version: '1.0.0',
            description: 'Orquestador que agrega auth, usuarios y project-manager para el frontend',
        },
        servers: [{ url: `http://localhost:${PORT}` }],
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
    apis: buildSwaggerApiGlobs(__dirname, ['presentation/http/routes']),
});
app.use(express.json());
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
});
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
    res.status(200).json({
        status: 'ok',
        service: 'bff',
        timestamp: new Date().toISOString(),
    });
});
app.use(config.API_GATEWAY_PREFIX, apiGateway);
app.use(handleNotFound);
app.use(handleError);
app.listen(PORT, () => {
    console.log(`🚀 BFF (Orquestador) escuchando en puerto ${PORT}`);
    console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
});
export default app;
