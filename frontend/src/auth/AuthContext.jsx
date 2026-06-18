import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { getStoredUser, getToken, login as apiLogin, logout as apiLogout } from '../api/bffClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getToken());

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setToken(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(token),
      async login(email, password) {
        const data = await apiLogin(email, password);
        setUser(data.usuario);
        setToken(data.token);
        return data;
      },
      logout
    }),
    [user, token, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
