const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(cors());

// Rutas iniciales vacías
app.post('/register', (req, res) => {
  res.status(501).json({ message: 'Endpoint /register en desarrollo' });
});

app.post('/login', (req, res) => {
  res.status(501).json({ message: 'Endpoint /login en desarrollo' });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Auth Microservice' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Microservicio Auth ejecutándose en puerto ${PORT}`);
});

module.exports = app;
