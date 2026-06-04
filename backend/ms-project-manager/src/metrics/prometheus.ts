// @ts-nocheck
export {};
const client = require('prom-client');
const config = require('../config');

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'nodejs_'
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Latencia HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de peticiones HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

/** Reduce cardinalidad: UUIDs → :id */
function normalizeRoute(urlPath) {
  if (!urlPath) return 'unknown';
  const pathOnly = urlPath.split('?')[0];
  return pathOnly.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
    ':id'
  );
}

function shouldSkipMetrics(req) {
  const p = req.path || '';
  if (p === config.metricsPath) return true;
  if (p === '/health') return true;
  return false;
}

function metricsMiddleware(req, res, next) {
  if (!config.enableMetrics) return next();
  if (shouldSkipMetrics(req)) return next();

  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const route = normalizeRoute(req.originalUrl || req.url || req.path);
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode)
    };
    const seconds = Number(process.hrtime.bigint() - start) / 1e9;
    httpRequestDuration.observe(labels, seconds);
    httpRequestsTotal.inc(labels);
  });
  next();
}

async function metricsHandler(req, res) {
  if (!config.enableMetrics) {
    res.status(404).type('text/plain').send('Metrics disabled (ENABLE_METRICS=0)');
    return;
  }
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).type('text/plain').send(err.message);
  }
}

module.exports = {
  register,
  metricsMiddleware,
  metricsHandler
};
