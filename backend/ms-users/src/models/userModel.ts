type UserModelData = {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  skills?: string;
  availability?: string;
  weeklyAvailableHours?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type DbUserRow = {
  id?: number;
  nombre?: string;
  email?: string;
  password?: string;
  rol?: string;
  habilidades?: string;
  disponibilidad?: string;
  horas_semanales_disponibles?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

/**
 * Entidad de dominio: representa un usuario del sistema con propiedades en inglés.
 * El repository crea instancias a partir de filas PostgreSQL (columnas en español).
 */
class UserModel {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  skills: string;
  availability: string;
  weeklyAvailableHours: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  constructor(data: UserModelData) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.skills = data.skills ?? '';
    this.availability = data.availability ?? 'disponible';
    this.weeklyAvailableHours = data.weeklyAvailableHours ?? 40;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  hasRole(role: string) {
    return this.role === role;
  }

  /** Objeto seguro para capa de servicio/DTO (sin password). */
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

function mapUserRow(row: DbUserRow | null | undefined): UserModel | null {
  if (!row) return null;
  return new UserModel({
    id: row.id as number,
    name: row.nombre as string,
    email: row.email as string,
    password: row.password,
    role: row.rol as string,
    skills: row.habilidades ?? '',
    availability: row.disponibilidad ?? 'disponible',
    weeklyAvailableHours: row.horas_semanales_disponibles ?? 40,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt
  });
}

function mapUserRows(rows: DbUserRow[]): UserModel[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => mapUserRow(row) as UserModel);
}

export default UserModel;
export { mapUserRow, mapUserRows };
