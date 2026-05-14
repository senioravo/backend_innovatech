const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  PORT: parseInt(process.env.PORT || '3010', 10) || 3010,
  API_GATEWAY_PREFIX: (process.env.API_GATEWAY_PREFIX || '/api/v1').trim() || '/api/v1'
};
