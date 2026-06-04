const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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

export async function loginUser(credentials) {
  return postJson('/auth-service/login', credentials);
}

export async function registerUser(credentials) {
  return postJson('/auth-service/register', credentials);
}

export async function getProjects(token) {
  return getJson('/project-manager-service/projects', token);
}