import type { JwtPayload } from 'jsonwebtoken';

export interface AuthJwtPayload extends JwtPayload {
  id?: string | number;
  email?: string;
  role?: string;
  rol?: string;
}

export function asAuthPayload(decoded: string | JwtPayload): AuthJwtPayload {
  if (typeof decoded === 'string') {
    throw new Error('Invalid JWT payload');
  }
  return decoded as AuthJwtPayload;
}
