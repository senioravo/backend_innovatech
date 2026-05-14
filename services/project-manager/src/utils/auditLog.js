/**
 * Auditoría básica: una línea JSON por evento (fácil de grep / enviar a agregador).
 */
function auditLog(entry) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    type: 'AUDIT',
    ...entry
  });
  console.info(line);
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
