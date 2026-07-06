/**
 * Payload JWT decodificado usado en ms-auth y servicios downstream.
 * Soporta campos en inglés (`role`) y español (`rol`).
 */
import type { JwtPayload } from 'jsonwebtoken';

/** Claims estándar más identidad de usuario Innovatech */
export interface AuthJwtPayload extends JwtPayload {
  id?: string | number;
  email?: string;
  role?: string;
  rol?: string;
}

/**
 * Normaliza el resultado de jwt.verify a AuthJwtPayload tipado.
 * @param {string|JwtPayload} decoded - Payload decodificado
 * @returns {AuthJwtPayload}
 * @throws {Error} Si el token es string (payload inválido)
 */
export function asAuthPayload(decoded: string | JwtPayload): AuthJwtPayload {
  if (typeof decoded === 'string') {
    throw new Error('Invalid JWT payload');
  }
  return decoded as AuthJwtPayload;
}
