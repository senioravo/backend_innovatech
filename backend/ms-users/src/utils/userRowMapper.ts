type NameRoleInput = {
  name?: string;
  nombre?: string;
  role?: string;
  rol?: string;
};

function pickName(body: NameRoleInput = {}) {
  return body.name ?? body.nombre ?? null;
}

function pickRole(body: NameRoleInput = {}) {
  return body.role ?? body.rol ?? null;
}

export { pickName, pickRole };
