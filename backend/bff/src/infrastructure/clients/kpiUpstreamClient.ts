export {};
const config = require('../../config');
const { joinUrl, upstreamJson } = require('../http/httpUpstream');

function pickForwardHeaders(req) {
  const out: Record<string, string> = {};
  if (req.headers.authorization) out.Authorization = req.headers.authorization;
  if (req.headers['x-user-id']) out['X-User-Id'] = req.headers['x-user-id'];
  if (req.headers['x-user-email']) out['X-User-Email'] = req.headers['x-user-email'];
  if (req.headers['x-user-role']) out['X-User-Role'] = req.headers['x-user-role'];
  const ct = req.headers['content-type'];
  if (ct) out['Content-Type'] = ct;
  return out;
}

const kpiUpstreamClient = {
  getDashboard(req) {
    const path = `${config.kpiApiPrefix}/kpis/dashboard`;
    return upstreamJson(joinUrl(config.kpiBaseUrl, path), {
      method: 'GET',
      headers: pickForwardHeaders(req)
    });
  }
};

module.exports = kpiUpstreamClient;
