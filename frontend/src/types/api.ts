/**
 * Tipos compartidos del frontend para sesión, proyectos, tareas y KPIs.
 * Alineados con las respuestas del BFF (`/api/v1/proyectos`, `/consultations/kpis`, etc.).
 */

/** Usuario autenticado persistido en localStorage y devuelto por el BFF */
export type UserSession = {
  id?: string | number | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  roleDescription?: string | null;
  permissions?: unknown;
};

/** Proyecto listado en el dashboard */
export type Project = {
  id: string;
  name: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
};

/** Tarea asociada a un proyecto con estado Kanban */
export type Task = {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  status: string;
  completed: boolean;
};

/** Resumen agregado de tareas por estado */
export type TaskSummary = {
  total: number;
  byStatus: Record<string, number>;
};

/** Respuesta GET /proyectos */
export type ProjectsResponse = {
  user?: UserSession;
  projects?: Project[];
};

/** Respuesta GET /proyectos/:id/tareas */
export type TasksResponse = {
  projectId: string;
  tasks?: Task[];
  summary?: TaskSummary;
};

/** Respuesta GET /consultations/kpis (directivo/gestor) */
export type KpisResponse = {
  projectProgressPct?: number;
  totalTasks?: number;
  completedTasks?: number;
  resourceUtilization?: { utilizationPct?: number };
};
