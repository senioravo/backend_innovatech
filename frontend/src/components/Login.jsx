import { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

function Login({ onSuccess, setLoading, setError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = mode === 'login'
        ? await loginUser({ email, password })
        : await registerUser({ email, password });

      if (response?.user && response?.token) {
        onSuccess(response.user, response.token);
      } else {
        setError(response?.message || 'Las credenciales no son válidas.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servicio de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card card-panel">
      <div className="section-title">
        <h2>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
        <p>Auth-service de Innovatech Chile para comenzar a gestionar proyectos.</p>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="nombre@empresa.cl"
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="••••••••"
          />
        </label>

        <button type="submit" className="button-primary">
          {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>
      </form>

      <div className="form-footer">
        <span>{mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}</span>
        <button
          type="button"
          className="button-link"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          {mode === 'login' ? 'Regístrate' : 'Volver a iniciar sesión'}
        </button>
      </div>
    </section>
  );
}

export default Login;
