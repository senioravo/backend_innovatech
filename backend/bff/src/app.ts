export {};
require('dotenv').config();
/**
 * Arquitectura en capas (dependencias hacia abajo):
 * - presentation/http → application → infrastructure
 * - config / utils: transversales
 */
const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiGateway = require('./presentation/http/gateway/apiGateway');
const { handleNotFound, handleError } = require('./utils/responseUtil');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'bff'
  });
});

app.use(config.API_GATEWAY_PREFIX, apiGateway);

app.use(handleNotFound);
app.use(handleError);

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`BFF escuchando en puerto ${PORT}`);
});

module.exports = app;
