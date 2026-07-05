import { Router } from 'express';
import { captureMessage, getServiceName } from './glitchtip.js';

const demoRouter = Router();

/**
 * Endpoints de prueba para GlitchTip (logs, mensajes y errores).
 */
demoRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: getServiceName(),
    requestId: res.getHeader('X-Request-Id'),
    timestamp: new Date().toISOString(),
  });
});

demoRouter.get('/log', (req, res) => {
  const requestId = res.getHeader('X-Request-Id');
  console.info(`[demo] Log de prueba (${getServiceName()})`, { requestId });
  captureMessage(`Demo log desde /api/demo/log (${getServiceName()})`, 'info');
  res.json({ message: 'Log enviado', service: getServiceName(), requestId });
});

demoRouter.get('/message', (req, res) => {
  captureMessage(`Mensaje directo a GlitchTip (${getServiceName()})`, 'warning');
  res.json({ message: 'Mensaje enviado a GlitchTip', service: getServiceName() });
});

demoRouter.get('/error', (_req, _res, next) => {
  next(new Error(`Error de prueba GlitchTip (${getServiceName()})`));
});

export default demoRouter;
