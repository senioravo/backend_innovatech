const express = require('express');

/**
 * Router raíz del BFF. Aquí se registrarán rutas que agreguen llamadas a microservicios.
 */
const gatewayRouter = express.Router();

module.exports = gatewayRouter;
