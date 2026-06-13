"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * UserModel - Entidad de Usuario
 * Representa la estructura de datos de un usuario tal como existe en la base de datos
 *
 * PROPÓSITO:
 * - Modelo de dominio que representa un usuario del sistema
 * - Encapsula la estructura de la tabla 'usuarios' en PostgreSQL
 * - Proporciona una representación tipada y consistente
 *
 * CAMPOS:
 * - id: Identificador único del usuario
 * - nombre: Nombre completo del usuario
 * - email: Correo electrónico (único, usado para login)
 * - password: Contraseña hasheada con bcrypt (NUNCA se expone en DTOs)
 * - rol: Rol del usuario (gestor, profesional, directivo)
 * - createdAt: Fecha de creación del registro
 * - updatedAt: Fecha de última actualización
 */
class UserModel {
    constructor({ id, nombre, email, password, rol, createdAt, updatedAt }) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password; // Hasheada con bcrypt
        this.rol = rol;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt ?? null;
    }
    /**
     * Método auxiliar para verificar si el usuario tiene un rol específico
     */
    hasRole(roleName) {
        return this.rol === roleName;
    }
    /**
     * Método auxiliar para obtener datos seguros (sin password)
     */
    toSafeObject() {
        return {
            id: this.id,
            nombre: this.nombre,
            email: this.email,
            rol: this.rol,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
module.exports = UserModel;
