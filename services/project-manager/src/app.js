require('dotenv').config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiGateway = require('./gateway/apiGateway');
const { getAuthDependencyStatus } = require('./clients/authServiceClient');
const { handleNotFound, handleError } = require('./utils/responseUtil');
const { verifyDatabase } = require('./db/verify');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/health', async (req, res) => {
  res.json({
    status: 'OK',
    service: 'Project Manager',
    dependencies: { auth: await getAuthDependencyStatus() }
  });
});

app.use(config.API_GATEWAY_PREFIX, apiGateway);

app.use(handleNotFound);

app.use(handleError);

const PORT = config.PORT;

verifyDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Project Manager ejecutándose en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a PostgreSQL:', err.message);
    process.exit(1);
  });

module.exports = app;
