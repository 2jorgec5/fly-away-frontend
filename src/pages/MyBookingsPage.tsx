import { useEffect, useState } from 'react';
import api, { getSavedBookingIdsForUser } from '../api';
import type { BookingDetail, UserProfile } from '../types';

interface MyBookingsPageProps {
  user: UserProfile | null;
}

export default function MyBookingsPage({ user }: MyBookingsPageProps) {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      const savedIds = getSavedBookingIdsForUser(user.email);
      if (savedIds.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const results = await Promise.allSettled(
        savedIds.map((id) => api.get<BookingDetail>(`/flights/book/${id}`))
      );

      const validBookings = results
        .filter(
          (r): r is PromiseFulfilledResult<{ data: BookingDetail }> =>
            r.status === 'fulfilled'
        )
        .map((r) => r.value.data);

      setBookings(validBookings);
      setLoading(false);
    };

    fetchBookings();
  }, [user]);

  return (
    <div className="page-container">
      <div className="card">
        <h2>Mis Reservas</h2>
        <p className="subtitle">
          Historial de vuelos reservados por {user?.firstName} {user?.lastName} ({user?.email})
        </p>

        {loading ? (
          <p>Cargando tus reservas...</p>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <p>Aún no tienes reservas activas registradas en esta sesión.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID Reserva</th>
                  <th>Número de Vuelo</th>
                  <th>Aerolínea</th>
                  <th>Fecha de Salida</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td><strong>{b.flightNumber}</strong></td>
                    <td>{b.airlineName}</td>
                    <td>{new Date(b.estDepartureTime).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedBooking(b)}
                      >
                        Ver más
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="card detail-card">
          <div className="detail-header">
            <h3>Detalle Completo — Reserva #{selectedBooking.id}</h3>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setSelectedBooking(null)}
            >
              Cerrar
            </button>
          </div>
          <div className="detail-grid">
            <p><strong>ID Reserva:</strong> #{selectedBooking.id}</p>
            <p><strong>Vuelo:</strong> {selectedBooking.flightNumber} (ID: {selectedBooking.flightId})</p>
            <p><strong>Aerolínea:</strong> {selectedBooking.airlineName}</p>
            <p><strong>Pasajero:</strong> {selectedBooking.customerFirstName} {selectedBooking.customerLastName}</p>
            <p><strong>Reservado el:</strong> {new Date(selectedBooking.bookingDate).toLocaleString()}</p>
            <p><strong>Salida:</strong> {new Date(selectedBooking.estDepartureTime).toLocaleString()}</p>
            <p><strong>Llegada:</strong> {new Date(selectedBooking.estArrivalTime).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}