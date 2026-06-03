export {};

declare global {
  namespace Express {
    interface Request {
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
