const BASE = process.env.API_BASE || 'http://localhost:8010/api/v1';

async function req(method, path, { body, token } = {}) {
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
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

const login = await req('POST', '/auth/login', {
  body: { email: 'gestor@innovatech.cl', password: 'Secret123' }
});
console.log('LOGIN', login.status);
const token = (login.data?.data ?? login.data)?.token;
if (!token) {
  console.error('No token', login.data);
  process.exit(1);
}

const create = await req('POST', '/projects', {
  token,
  body: {
    name: 'Proyecto Test CRUD',
    description: 'Descripcion de prueba con mas de diez caracteres',
    startDate: '2026-01-01',
    endDate: '2026-12-31'
  }
});
console.log('CREATE', create.status, create.data);

const list = await req('GET', '/proyectos', { token });
const projects = list.data?.projects ?? [];
console.log('LIST', list.status, 'count=', projects.length);

const created = projects.find((p) => p.name === 'Proyecto Test CRUD');
const pid = created?.id ?? create.data?.id;
console.log('PROJECT_ID', pid);

if (pid) {
  const del = await req('DELETE', `/projects/${pid}`, { token });
  console.log('DELETE', del.status, del.data);
}
