/**
 * Página de inicio de sesión.
 * Envía credenciales al BFF vía AuthContext y redirige a /dashboard.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/** Formulario email/password con manejo de errores y estado loading */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /** @param {React.FormEvent} e */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__backdrop" aria-hidden="true" />
      <div className="card card-panel login-card">
        <div className="login-brand">
          <span className="login-brand__mark">IT</span>
          <div>
            <p className="brand-subtitle">Plataforma de gestión</p>
            <h1>Innovatech — Login</h1>
          </div>
        </div>
        <p className="page-description">
          Autenticación segura vía BFF → Auth. Accede con tu cuenta corporativa.
        </p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.cl"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className="button-primary button-primary--full" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
