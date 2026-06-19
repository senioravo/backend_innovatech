const ESTADO_LABELS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  IN_REVIEW: 'En revisión',
  DONE: 'Completada'
};

const ESTADO_ORDER = ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export function formatEstado(estado) {
  return ESTADO_LABELS[estado] ?? estado ?? 'Desconocido';
}

export function formatPorcentaje(rate) {
  const value = Number(rate);
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

export function buildEstadoItems(porEstado = {}) {
  return ESTADO_ORDER.map((key) => ({
    key,
    label: formatEstado(key),
    count: porEstado[key] ?? 0
  }));
}

export function hasKpiResumen(data) {
  return Boolean(data?.resumen);
}
