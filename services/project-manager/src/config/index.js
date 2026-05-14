const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3002,
  JWT_SECRET: process.env.JWT_SECRET || 'cambiar_en_produccion',
  API_GATEWAY_PREFIX: process.env.API_GATEWAY_PREFIX || '/api/v1'
};
