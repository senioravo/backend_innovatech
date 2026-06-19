export type UserSession = {
  id?: string | number | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  roleDescription?: string | null;
  permissions?: unknown;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
};

export type Task = {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  status: string;
  completed: boolean;
};

export type TaskSummary = {
  total: number;
  byStatus: Record<string, number>;
};

export type ProjectsResponse = {
  user?: UserSession;
  projects?: Project[];
};

export type TasksResponse = {
  projectId: string;
  tasks?: Task[];
  summary?: TaskSummary;
};

export type KpisResponse = {
  projectProgressPct?: number;
  totalTasks?: number;
  completedTasks?: number;
  resourceUtilization?: { utilizationPct?: number };
};
