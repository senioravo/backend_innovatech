/**
 * UserModel - Entidad de dominio Usuario (tabla `usuarios`).
 * Encapsula la fila de PostgreSQL y expone helpers de dominio.
 */
class UserModel {
  id: number;
  name: string;
  email: string;
  role: string;
  password?: string;
  skills: string;
  availability: string;
  weeklyAvailableHours: number;
  createdAt: unknown;
  updatedAt: unknown;

  constructor(data: {
    id: number;
    name: string;
    email: string;
    role: string;
    password?: string;
    skills?: string;
    availability?: string;
    weeklyAvailableHours?: number;
    createdAt?: unknown;
    updatedAt?: unknown;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.password = data.password;
    this.skills = data.skills ?? '';
    this.availability = data.availability ?? 'disponible';
    this.weeklyAvailableHours = data.weeklyAvailableHours ?? 40;
    this.createdAt = data.createdAt ?? null;
    this.updatedAt = data.updatedAt ?? null;
  }

  /**
   * Crea entidad desde fila PostgreSQL (columnas en español).
   * @param {Record<string, unknown>|null|undefined} row
   * @returns {UserModel|null}
   */
  static fromRow(row: Record<string, unknown> | null | undefined): UserModel | null {
    if (!row) return null;
    return new UserModel({
      id: row.id as number,
      name: String(row.nombre ?? row.name ?? ''),
      email: String(row.email ?? ''),
      role: String(row.rol ?? row.role ?? ''),
      password: row.password as string | undefined,
      skills: String(row.habilidades ?? row.skills ?? ''),
      availability: String(row.disponibilidad ?? row.availability ?? 'disponible'),
      weeklyAvailableHours: Number(row.horas_semanales_disponibles ?? row.weeklyAvailableHours ?? 40),
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt
    });
  }

  /**
   * Crea entidad desde objeto plano (API / JSON).
   * @param {Record<string, unknown>|null|undefined} data
   * @returns {UserModel|null}
   */
  static fromPlain(data: Record<string, unknown> | null | undefined): UserModel | null {
    if (!data || data.id == null) return null;
    return new UserModel({
      id: data.id as number,
      name: String(data.name ?? data.nombre ?? ''),
      email: String(data.email ?? ''),
      role: String(data.role ?? data.rol ?? ''),
      password: data.password as string | undefined,
      skills: String(data.skills ?? data.habilidades ?? ''),
      availability: String(data.availability ?? data.disponibilidad ?? 'disponible'),
      weeklyAvailableHours: Number(data.weeklyAvailableHours ?? data.horas_semanales_disponibles ?? 40),
      createdAt: data.createdAt ?? data.created_at,
      updatedAt: data.updatedAt ?? data.updated_at
    });
  }

  /** @param {string} roleName */
  hasRole(roleName: string) {
    return this.role === roleName;
  }

  /** Datos seguros para API (sin password). */
  toSafeObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      skills: this.skills,
      availability: this.availability,
      weeklyAvailableHours: this.weeklyAvailableHours,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default UserModel;
