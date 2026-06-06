// @ts-nocheck
export {};
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const userRoutes = require('./routes/user.routes');
const internalRoutes = require('./routes/internal.routes');
const metricsRoutes = require('./routes/metrics.routes');

// Importar logger
const logger = require('./utils/logger');

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(cors());

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
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  logger.info(`🚀 Microservicio Users ejecutándose en puerto ${PORT}`);
  console.log(`🚀 Microservicio Users ejecutándose en puerto ${PORT}`);
});

module.exports = app;
