/**
 * Contexto React de autenticación.
 * Sincroniza sesión con localStorage (bffClient) y expone login/logout a la UI.
 */
import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react';
import { getStoredUser, getToken, login as apiLogin, logout as apiLogout } from '../api/bffClient';
import type { UserSession } from '../types/api';

/** Valor expuesto por AuthContext a componentes hijos */
type AuthContextValue = {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ token: string; user?: UserSession }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Proveedor de autenticación; debe envolver rutas que usen useAuth.
 * @param {{ children: ReactNode }} props
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getToken());

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setToken(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setUser(data.user ?? getStoredUser());
    setToken(data.token);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(token),
      login,
      logout
    }),
    [user, token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acceder al contexto de auth.
 * @returns {AuthContextValue}
 * @throws {Error} Si se usa fuera de AuthProvider
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
