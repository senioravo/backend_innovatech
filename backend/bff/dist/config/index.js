// @ts-nocheck
import dotenv from 'dotenv';
dotenv.config();
const trimBase = (v, fallback) => (v || fallback || '').trim().replace(/\/$/, '');
const config = {
    PORT: parseInt(process.env.PORT || '3010', 10) || 3010,
    JWT_SECRET: process.env.JWT_SECRET || 'cambiar_en_produccion',
    API_GATEWAY_PREFIX: (process.env.API_GATEWAY_PREFIX || '/api/v1').trim() || '/api/v1',
    authServiceBaseUrl: trimBase(process.env.AUTH_SERVICE_BASE_URL, 'http://localhost:3001'),
    authApiPrefix: (process.env.AUTH_API_PREFIX || '/api/auth').trim() || '/api/auth',
    projectManagerBaseUrl: trimBase(process.env.PROJECT_MANAGER_BASE_URL, 'http://localhost:3002'),
    projectManagerApiPrefix: (process.env.PROJECT_MANAGER_API_PREFIX || '/api/v1').trim() || '/api/v1'
};
export default config;
