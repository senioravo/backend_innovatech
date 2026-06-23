import express from 'express';
import { getMetrics } from '../middleware/metricsMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.set('Content-Type', 'text/plain');
    const metrics = await getMetrics();
    res.send(metrics);
  } catch {
    res.status(500).send('Error al obtener métricas');
  }
});

export default router;
