/**
 * Constantes y utilidades de dominio para estados de tarea en ms-kpi.
 * Define el catálogo de estados y funciones de agregación para métricas del dashboard.
 */

/** Lista inmutable de estados de tarea reconocidos por el dominio KPI. */
const TASK_STATUSES = Object.freeze(['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']);

/**
 * Cuenta tareas agrupadas por estado, inicializando todos los estados en cero.
 * @param {object[]} tasks - Lista de tareas con propiedad `status`.
 * @returns {Record<string, number>} Mapa estado → cantidad de tareas.
 */
function countByStatus(tasks) {
  const counts = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0]));
  for (const t of tasks) {
    const s = t.status ?? 'PENDING';
    if (Object.prototype.hasOwnProperty.call(counts, s)) counts[s] += 1;
  }
  return counts;
}

/**
 * Calcula la tasa de completitud (tareas DONE / total) redondeada a dos decimales.
 * @param {Record<string, number>} countByStatusMap - Conteo por estado (salida de countByStatus).
 * @param {number} total - Número total de tareas consideradas.
 * @returns {number} Proporción entre 0 y 1 (0 si total es 0).
 */
function completionRate(countByStatusMap, total) {
  if (!total) return 0;
  const done = countByStatusMap.DONE ?? 0;
  return Math.round((done / total) * 100) / 100;
}

module.exports = { TASK_STATUSES, countByStatus, completionRate };
