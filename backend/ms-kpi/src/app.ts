require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');
const apiGateway = require('./presentation/gateway/apiGateway');
const { handleNotFound, handleError } = require('./utils/responseUtil');
const { buildSwaggerApiGlobs } = require('./utils/swaggerPaths');

const app = express();

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KPI Service API',
      version: '1.0.0',
      description:
        'Microservicio de KPIs y progreso de tareas/proyectos. Agrega datos de project-manager para el dashboard del usuario autenticado.'
    },
    servers: [{ url: `http://localhost:${config.PORT}` }],
    tags: [
      { name: 'Health', description: 'Estado del servicio' },
      { name: 'KPIs', description: 'Métricas y dashboard de progreso' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        KpiSummary: {
          type: 'object',
          properties: {
            totalProjects: { type: 'integer', example: 3 },
            totalTasks: { type: 'integer', example: 12 },
            countByStatus: {
              type: 'object',
              additionalProperties: { type: 'integer' },
              example: { PENDING: 4, IN_PROGRESS: 5, DONE: 3 }
            },
            completionRate: { type: 'number', format: 'float', example: 0.25 }
          }
        },
        KpiProjectSummary: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            assigneeId: { type: 'string', nullable: true },
            startDate: { type: 'string', format: 'date', nullable: true },
            endDate: { type: 'string', format: 'date', nullable: true }
          }
        },
        KpiRecentTask: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'string', example: 'PENDING' },
            completed: { type: 'boolean' },
            projectId: { type: 'string' },
            projectName: { type: 'string', nullable: true }
          }
        },
        KpiDashboard: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            summary: { $ref: '#/components/schemas/KpiSummary' },
            projects: {
              type: 'array',
              items: { $ref: '#/components/schemas/KpiProjectSummary' }
            },
            recentTasks: {
              type: 'array',
              items: { $ref: '#/components/schemas/KpiRecentTask' }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: buildSwaggerApiGlobs(__dirname, ['presentation/routes'])
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
 *     summary: Health check del microservicio KPI
 *     responses:
 *       200:
 *         description: Servicio operativo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 service:
 *                   type: string
 *                   example: KPI Service
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
    const pathCount = Object.keys(swaggerSpec.paths || {}).length;
    console.log(`KPI Service ejecutándose en puerto ${PORT}`);
    console.log(`📚 Swagger: http://localhost:${PORT}/api-docs (${pathCount} endpoints)`);
    if (pathCount === 0) {
      console.warn('[KPI-SWAGGER] ⚠️ No se encontraron rutas @openapi. Revisar buildSwaggerApiGlobs.');
    }
  });
}

module.exports = app;
