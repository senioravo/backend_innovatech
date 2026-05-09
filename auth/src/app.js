const express = require('express');
const cors = require('cors');
require('dotenv').config();

// AS-TASK-02: Importar rutas de autenticación para API Gateway
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(cors());

// AS-TASK-02: Configurar rutas con prefijo /api/auth para API Gateway
app.use('/api/auth', authRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Microservicio Auth ejecutándose en puerto ${PORT}`);
});

module.exports = app;
