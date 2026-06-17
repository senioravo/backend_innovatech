// El puerto 8010 es el expuesto por KrakenD en Docker para el mundo exterior [5, 7].
// Se recomienda que VITE_API_URL incluya el prefijo /api/v1 según krakend.json [3, 8].
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8010/api/v1';

async function handleResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      error: true,
      message: data?.message || 'Error en la solicitud.',
    };
  }
  return data;
}

// Helper para peticiones POST (Login, Registro) [9]
async function postJson(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

// Helper para peticiones GET (Listar proyectos) [2]
async function getJson(path, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // KrakenD validará este JWT [10, 11]
      'Content-Type': 'application/json',
    },
  });

  return handleResponse(response);
}

export async function loginUser(credentials) {
  return postJson('/auth/login', credentials);
}

export async function registerUser(credentials) {
  return postJson('/auth/register', credentials);
}

export async function getProjects(token) {
  return getJson('/projects', token);
}