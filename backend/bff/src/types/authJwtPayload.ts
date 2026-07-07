/**
 * Tipos y utilidades para el payload JWT de autenticación Innovatech.
 * Extiende JwtPayload con los claims de identidad usados en el BFF.
 */
import type { JwtPayload } from 'jsonwebtoken';

/**
 * Payload JWT decodificado con claims de usuario Innovatech.
 * Soporta alias `rol` además de `role` por compatibilidad con ms-auth.
 */
export interface AuthJwtPayload extends JwtPayload {
  /** Identificador único del usuario. */
  id?: string | number;
  /** Correo electrónico del usuario. */
  email?: string;
  /** Rol del usuario (nombre canónico en inglés). */
  role?: string;
  /** Rol del usuario (alias en español usado por algunos servicios). */
  rol?: string;
}

/**
 * Convierte el resultado de `jwt.verify` a un AuthJwtPayload tipado.
 * @param {string|JwtPayload} decoded - Valor devuelto por jsonwebtoken tras verificar el token.
 * @returns {AuthJwtPayload} Payload tipado listo para extraer id, email y rol.
 * @throws {Error} Si el valor decodificado es un string en lugar de un objeto payload.
 */
export function asAuthPayload(decoded: string | JwtPayload): AuthJwtPayload {
  if (typeof decoded === 'string') {
    throw new Error('Invalid JWT payload');
  }
  return decoded as AuthJwtPayload;
}
