import { Link, useNavigate } from 'react-router-dom';
import type { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/flights">✈️ Fly Away Travel</Link>
      </div>

      <nav className="navbar-links">
        <Link to="/flights">Buscar Vuelos</Link>
        {user ? (
          <>
            <Link to="/my-bookings">Mis Reservas</Link>
            <span className="user-badge">
              👤 {user.firstName} {user.lastName}
            </span>
            <button onClick={handleLogoutClick} className="btn btn-danger btn-sm">
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar Sesión</Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Registrarse
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}