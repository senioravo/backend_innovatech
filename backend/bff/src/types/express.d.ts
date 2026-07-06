/**
 * Extensión de tipos Express para el BFF (`req.user` tras jwtAuthMiddleware).
 */
export {};

declare global {
  namespace Express {
    interface Request {
      /** Usuario autenticado extraído de JWT o headers del gateway */
      user?: {
        id?: string | number;
        email?: string;
        role?: string;
      };
    }
  }
}
