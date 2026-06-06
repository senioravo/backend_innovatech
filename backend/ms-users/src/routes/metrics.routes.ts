// @ts-nocheck
export {};
// Rutas de métricas Prometheus

const express = require('express');
const router = express.Router();
const { getMetrics } = require('../middleware/metricsMiddleware');

/**
 * GET /metrics - Endpoint para Prometheus
 * Retorna métricas en formato Prometheus
 */
router.get('/', async (req, res) => {
  try {
    res.set('Content-Type', 'text/plain');
    const metrics = await getMetrics();
    res.send(metrics);
  } catch (error) {
    res.status(500).send('Error al obtener métricas');
  }
});

module.exports = router;
