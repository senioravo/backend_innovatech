// @ts-nocheck
export {};
// Modelo de Usuario - Representación de la estructura de datos
// Este modelo define la estructura de un usuario en la base de datos

/**
 * Interface de Usuario
 * @typedef {Object} User
 * @property {number} id - ID único del usuario
 * @property {string} nombre - Nombre completo del usuario
 * @property {string} email - Email único del usuario
 * @property {string} password - Contraseña hasheada (bcrypt)
 * @property {string} rol - Rol del usuario (gestor, profesional, directivo)
 * @property {Date} created_at - Fecha de creación
 * @property {Date} updated_at - Fecha de última actualización
 */

class UserModel {
  constructor(data) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.email = data.email;
    this.password = data.password;
    this.rol = data.rol;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Obtener representación segura del usuario (sin password)
   * @returns {Object} - Usuario sin campos sensibles
   */
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

module.exports = UserModel;
