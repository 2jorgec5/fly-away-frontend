import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Interceptor de solicitud: adjunta el token JWT si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: si un endpoint protegido da 403, limpia sesión y redirige a /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Extrae el mensaje de error enviado por Spring Boot (ProblemDetail)
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.detail ?? 'Error en la solicitud o de conexión con el servidor';
  }
  return 'Error inesperado';
}

// Helpers para guardar y leer IDs de reserva por usuario en localStorage
export function saveBookingIdForUser(email: string, bookingId: number): void {
  const key = `bookings:${email}`;
  const current: number[] = JSON.parse(localStorage.getItem(key) ?? '[]');
  if (!current.includes(bookingId)) {
    localStorage.setItem(key, JSON.stringify([...current, bookingId]));
  }
}

export function getSavedBookingIdsForUser(email: string): number[] {
  const key = `bookings:${email}`;
  return JSON.parse(localStorage.getItem(key) ?? '[]');
}

export default api;