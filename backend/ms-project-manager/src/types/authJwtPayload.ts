/**
 * Tipos y utilidades para el payload JWT verificado en ms-project-manager.
 * Normaliza claims emitidos por ms-auth (role/rol, id, email).
 */
import type { JwtPayload } from 'jsonwebtoken';

/** Payload JWT decodificado con claims de usuario Innovatech */
export interface AuthJwtPayload extends JwtPayload {
  id?: string | number;
  email?: string;
  role?: string;
  rol?: string;
}

/**
 * Convierte el resultado de jwt.verify a AuthJwtPayload tipado.
 * @param {string|JwtPayload} decoded - Resultado de jwt.verify
 * @returns {AuthJwtPayload} Payload tipado para req.user
 */
export function asAuthPayload(decoded: string | JwtPayload): AuthJwtPayload {
  if (typeof decoded === 'string') {
    throw new Error('Invalid JWT payload');
  }
  return decoded as AuthJwtPayload;
}
