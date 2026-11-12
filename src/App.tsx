import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import type { UserProfile } from './types';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import FlightsPage from './pages/FlightsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import './App.css';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api
        .get<UserProfile>('/users/current')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/flights" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={(u) => setUser(u)} />}
          />
          <Route path="/flights" element={<FlightsPage user={user} />} />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage user={user} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}