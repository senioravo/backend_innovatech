/**
 * UserModel - Entidad de Usuario en ms-auth.
 * Representa datos recibidos de ms-users (HTTP); no persiste en BD local.
 */
class UserModel {
  id: unknown;
  name: unknown;
  email: unknown;
  password: unknown;
  role: unknown;
  createdAt: unknown;
  updatedAt: unknown;

  constructor(data: {
    id: unknown;
    name?: unknown;
    nombre?: unknown;
    email?: unknown;
    password?: unknown;
    role?: unknown;
    rol?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
  }) {
    this.id = data.id;
    this.name = data.name ?? data.nombre;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role ?? data.rol;
    this.createdAt = data.createdAt ?? null;
    this.updatedAt = data.updatedAt ?? null;
  }

  /**
   * Crea entidad desde respuesta JSON de ms-users.
   * @param {Record<string, unknown>|null|undefined} data
   * @returns {UserModel|null}
   */
  static fromPlain(data: Record<string, unknown> | null | undefined): UserModel | null {
    if (!data || data.id == null) return null;
    return new UserModel({
      id: data.id,
      name: data.name ?? data.nombre,
      email: data.email,
      password: data.password,
      role: data.role ?? data.rol,
      createdAt: data.createdAt ?? data.created_at,
      updatedAt: data.updatedAt ?? data.updated_at
    });
  }

  /** @param {string} roleName */
  hasRole(roleName: string) {
    return this.role === roleName;
  }

  /** Datos seguros (sin password) para logs o respuestas. */
  toSafeObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default UserModel;
