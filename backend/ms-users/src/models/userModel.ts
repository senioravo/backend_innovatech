class UserModel {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  created_at: Date;
  updated_at: Date;

  constructor(data: Record<string, unknown>) {
    this.id = data.id as number;
    this.nombre = data.nombre as string;
    this.email = data.email as string;
    this.password = data.password as string;
    this.rol = data.rol as string;
    this.created_at = data.created_at as Date;
    this.updated_at = data.updated_at as Date;
  }

  toSafeObject() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      rol: this.rol,
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }
}

export default UserModel;
