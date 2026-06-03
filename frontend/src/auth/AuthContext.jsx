import { createContext, useContext, useMemo, useState } from 'react';
import { getStoredUser, getToken, login as apiLogin, logout as apiLogout } from '../api/bffClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const token = getToken();

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(token),
      async login(email, password) {
        const data = await apiLogin(email, password);
        setUser(data.usuario);
        return data;
      },
      async logout() {
        await apiLogout();
        setUser(null);
      }
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
