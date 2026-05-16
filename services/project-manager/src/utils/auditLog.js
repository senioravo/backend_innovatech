const { sendAuditToElasticsearch } = require('../clients/elasticAuditClient');

/**
 * Auditoría básica: consola (JSON) + Elasticsearch opcional (ELASTICSEARCH_NODE).
 */
function auditLog(entry) {
  const doc = {
    ts: new Date().toISOString(),
    type: 'AUDIT',
    ...entry
  };
  console.info(JSON.stringify(doc));
  sendAuditToElasticsearch(doc).catch((err) => {
    console.error('[audit-es] index failed:', err.message);
  });
}

function auditFromRequest(req, partial) {
  auditLog({
    ...partial,
    actor: req.user
      ? { id: String(req.user.id), email: req.user.email, role: req.user.role }
      : null,
    method: req.method,
    path: req.originalUrl || req.url || ''
  });
}

module.exports = { auditLog, auditFromRequest };
