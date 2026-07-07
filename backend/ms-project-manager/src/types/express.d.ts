/**
 * Extensión de tipos Express para ms-project-manager (`req.user` tras authMiddleware).
 */
export {};

declare global {
  namespace Express {
    interface Request {
      /** Usuario autenticado con id, email y role */
      user?: {
        id?: string | number;
        email?: string;
        role?: string;
      };
    }
  }
}
