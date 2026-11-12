import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validación de campos vacíos antes de enviar al backend
    if (!email.trim() || !firstName.trim() || !lastName.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/register', {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });

      setSuccess('¡Registro exitoso! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2>Crear Cuenta</h2>
      <p className="subtitle">
        Nota: Nombre y apellido deben iniciar con mayúscula. La contraseña requiere mínimo 8 caracteres, 1 mayúscula y 1 número.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="nombre.apellido@utec.edu.pe"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Nombre (First Name)</label>
          <input
            type="text"
            placeholder="Jorge"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Apellido (Last Name)</label>
          <input
            type="text"
            placeholder="Cuevas"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="footer-text">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </div>
  );
}