/**
 * Smoke test E2E against local KrakenD (http://localhost:8010).
 * Prints PASS/FAIL only — no tokens or passwords in output.
 */
const BASE = process.env.API_BASE || 'http://localhost:8010/api/v1';
const EMAIL = process.env.SMOKE_EMAIL || 'gestor@innovatech.cl';
const PASSWORD = process.env.SMOKE_PASSWORD || 'Secret123';

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    await fn();
    console.log(`PASS  ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`FAIL  ${name}: ${err.message}`);
    failed += 1;
  }
}

async function json(method, path, { body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = data.message || data.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

let token = '';

await check('KrakenD health', async () => {
  const res = await fetch('http://localhost:8010/__health');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
});

await check('JWKS endpoint', async () => {
  const res = await fetch('http://localhost:8010/.well-known/jwks.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.keys) || data.keys.length === 0) {
    throw new Error('No JWKS keys');
  }
});

await check('Login', async () => {
  const data = await json('POST', '/auth/login', {
    body: { email: EMAIL, password: PASSWORD },
    token: null
  });
  const payload = data.data ?? data;
  token = payload.token;
  if (!token) throw new Error('Missing token in login response');
  const user = payload.user;
  if (!user?.email) throw new Error('Missing user in login response');
});

await check('List projects', async () => {
  const data = await json('GET', '/projects', { token });
  const projects = data.projects ?? data.data?.projects;
  if (!Array.isArray(projects)) throw new Error('projects is not an array');
});

await check('KPIs', async () => {
  const data = await json('GET', '/consultations/kpis', { token });
  const kpis = data.projectProgressPct !== undefined ? data : data.data;
  if (kpis?.projectProgressPct === undefined && kpis?.totalTasks === undefined) {
    throw new Error('Unexpected KPI payload');
  }
});

await check('Notifications', async () => {
  const data = await json('GET', '/notifications', { token });
  const list = data.notifications ?? data.data?.notifications;
  if (!Array.isArray(list)) throw new Error('notifications is not an array');
});

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
