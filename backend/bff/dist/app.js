// @ts-nocheck
import express from 'express';
import cors from 'cors';
import config from './config/index.js'; // Asegúrate de la ruta
import apiGateway from './presentation/http/gateway/apiGateway.js';
import { handleNotFound, handleError } from './utils/responseUtil.js';
const app = express();
app.use(express.json());
app.use(cors());
// ✅ EL CAMBIO MÁS IMPORTANTE:
// Cambia el prefijo a '/api' para que coincida con lo que KrakenD envía.
// KrakenD recibe /api/v1/auth/login y lo reenvía al BFF como /api/auth/login.
app.use('/api', apiGateway);
app.use(handleNotFound);
app.use(handleError);
const PORT = config.PORT || 3010;
app.listen(PORT, () => {
    console.log(`🚀 BFF (Orquestador) escuchando en puerto ${PORT}`);
});
export default app;
