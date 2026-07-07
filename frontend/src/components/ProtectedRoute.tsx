/**
 * Guard de ruta: redirige a /login si no hay sesión activa.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { ReactNode } from 'react';

/**
 * Envuelve contenido que requiere autenticación.
 * @param {{ children: ReactNode }} props - Contenido a renderizar si hay sesión
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
