const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiGateway = require('./gateway/apiGateway');
const { getAuthDependencyStatus } = require('./clients/authServiceClient');
const { handleNotFound, handleError } = require('./utils/responseUtil');

const app = express();

// Middlewares globales
app.use(express.json());
app.use(cors());

// Rutas de salud (incluye dependencias internas protegidas con circuit breaker)
app.get('/health', async (req, res) => {
  res.json({
    status: 'OK',
    service: 'Project Manager',
    dependencies: { auth: await getAuthDependencyStatus() }
  });
});

// API Gateway: enrutamiento centralizado (p. ej. /api/v1/projects)
app.use(config.API_GATEWAY_PREFIX, apiGateway);

// Manejo de errores: NO ENCONTRADO antes de errores generales
app.use(handleNotFound);

// Manejo centralizado de errores (SIEMPRE al final con 4 parámetros)
app.use(handleError);

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Project Manager ejecutándose en puerto ${PORT}`);
});

module.exports = app;

