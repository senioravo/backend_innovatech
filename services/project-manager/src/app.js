const express = require('express');
const cors = require('cors');
const config = require('./config');
const projectRoutes = require('./routes/projectRoutes');
const { handleNotFound, handleError } = require('./utils/responseUtil');

const app = express();

// Middlewares globales
app.use(express.json());
app.use(cors());

// Rutas de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Project Manager' });
});

// Rutas de dominio
app.use('/projects', projectRoutes);

// Manejo de errores: NO ENCONTRADO antes de errores generales
app.use(handleNotFound);

// Manejo centralizado de errores (SIEMPRE al final con 4 parámetros)
app.use(handleError);

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Project Manager ejecutándose en puerto ${PORT}`);
});

module.exports = app;

