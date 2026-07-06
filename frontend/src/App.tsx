/**
 * Raíz de la aplicación: router, AuthProvider y rutas login/dashboard.
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';

/**
 * Monta DashboardPage con key por sesión para resetear estado al cambiar usuario.
 */
function DashboardRoute() {
  const { user } = useAuth();
  const sessionKey = user?.email ?? user?.id ?? 'anonymous';
  return (
    <ProtectedRoute>
      <DashboardPage key={String(sessionKey)} />
    </ProtectedRoute>
  );
}

/** Componente raíz con rutas públicas y protegidas */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
