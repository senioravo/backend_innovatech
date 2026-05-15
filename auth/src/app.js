const express = require('express');
const cors = require('cors');
require('dotenv').config();

const logger = require('./utils/logger');
const { checkConnection } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const circuitBreakerRoutes = require('./routes/circuitBreaker.routes');
const exampleRoutes = require('./routes/example.routes');
const metricsRoutes = require('./routes/metrics.routes');
const { metricsMiddleware } = require('./middleware/metricsMiddleware');

const app = express();

app.use(express.json());
app.use(cors());
app.use(metricsMiddleware);
app.use('/api', metricsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/circuit-breaker', circuitBreakerRoutes);
app.use('/api/example', exampleRoutes);

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Auth ejecutandose en puerto ${PORT}`);
  });
}

module.exports = app;
