const express = require('express');
const cors = require('cors');
require('dotenv').config();

// AS-TASK-02: Importar rutas de autenticación para API Gateway
const authRoutes = require('./routes/auth.routes');

// AS-TASK-03: Importar rutas de Circuit Breaker
const circuitBreakerRoutes = require('./routes/circuitBreaker.routes');

// AS-TASK-09: Importar rutas de ejemplo para demostrar middleware de autorización
const exampleRoutes = require('./routes/example.routes');

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(cors());

// AS-TASK-02: Configurar rutas con prefijo /api/auth para API Gateway
app.use('/api/auth', authRoutes);

// AS-TASK-03: Configurar rutas de Circuit Breaker para pruebas
app.use('/api/circuit-breaker', circuitBreakerRoutes);

// AS-TASK-09: Configurar rutas de ejemplo para demostrar middleware de autorización por rol
app.use('/api/example', exampleRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Microservicio Auth ejecutándose en puerto ${PORT}`);
});

module.exports = app;

