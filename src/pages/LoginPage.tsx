import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import type { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<{ token: string }>('/auth/login', {
        email: email.trim(),
        password,
      });

      // Guardar el JWT con la clave exacta 'token'
      localStorage.setItem('token', data.token);

      // Nice to have (+0.1): Obtener perfil del usuario autenticado
      const meResponse = await api.get<UserProfile>('/users/current');
      localStorage.setItem('user', JSON.stringify(meResponse.data));
      onLoginSuccess(meResponse.data);

      navigate('/flights');
    } catch (err) {
      localStorage.removeItem('token');
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2>Iniciar Sesión</h2>
      <p className="subtitle">
        Usuario de prueba: <code>ana.garcia@utec.edu.pe</code> / <code>Password1</code>
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="ana.garcia@utec.edu.pe"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Password1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <p className="footer-text">
        ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
}