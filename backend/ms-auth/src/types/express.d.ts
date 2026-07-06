/**
 * Extensión de tipos Express para ms-auth (`req.user`, `req.userId` tras auth middleware).
 */
export {};

declare global {
  namespace Express {
    interface Request {
      /** Usuario decodificado del JWT */
      user?: {
        id?: string | number;
        email?: string;
        rol?: string;
        role?: string;
      };
      userId?: string | number;
    }
  }
}
