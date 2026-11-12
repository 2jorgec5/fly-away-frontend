import { useState, useEffect, type FormEvent } from 'react';
import api, { getErrorMessage, saveBookingIdForUser } from '../api';
import type { Flight, FlightSearchResponse, BookingDetail, UserProfile } from '../types';

interface FlightsPageProps {
  user: UserProfile | null;
}

export default function FlightsPage({ user }: FlightsPageProps) {
  const [flightNumber, setFlightNumber] = useState('');
  const [airlineName, setAirlineName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Estados para la reserva de vuelos
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [lastBookedId, setLastBookedId] = useState<number | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<BookingDetail | null>(null);
  const [bookingInProgressId, setBookingInProgressId] = useState<number | null>(null);

  const fetchFlights = async () => {
    setLoading(true);
    setSearchError(null);
    try {
      const { data } = await api.get<FlightSearchResponse>('/flights/search', {
        params: {
          flightNumber: flightNumber.trim() || undefined,
          airlineName: airlineName.trim() || undefined,
          estDepartureTimeFrom: from ? new Date(from).toISOString() : undefined,
          estDepartureTimeTo: to ? new Date(to).toISOString() : undefined,
        },
      });
      setFlights(data.items);
    } catch (err) {
      setSearchError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchFlights();
  };

  const handleClearFilters = () => {
    setFlightNumber('');
    setAirlineName('');
    setFrom('');
    setTo('');
  };

  const handleBookFlight = async (flightId: number) => {
    setBookingMessage(null);
    setBookingError(null);
    setLastBookedId(null);
    setSelectedBookingDetail(null);
    setBookingInProgressId(flightId);

    try {
      const { data } = await api.post<{ id: number }>('/flights/book', { flightId });
      setBookingMessage(`¡Vuelo reservado con éxito! ID de reserva: #${data.id}`);
      setLastBookedId(data.id);

      // Guardar ID en localStorage asociado al email del usuario para "Mis Reservas"
      if (user?.email) {
        saveBookingIdForUser(user.email, data.id);
      }

      // Actualizar asientos disponibles en la tabla
      fetchFlights();
    } catch (err) {
      setBookingError(getErrorMessage(err));
    } finally {
      setBookingInProgressId(null);
    }
  };

  const handleViewBookingDetail = async (bookingId: number) => {
    setBookingError(null);
    try {
      const { data } = await api.get<BookingDetail>(`/flights/book/${bookingId}`);
      setSelectedBookingDetail(data);
    } catch (err) {
      setBookingError(getErrorMessage(err));
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Búsqueda de Vuelos</h2>

        <form onSubmit={handleSearch} className="search-grid">
          <div className="form-group">
            <label>Número de Vuelo</label>
            <input
              type="text"
              placeholder="Ej. LA101, SK120"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Aerolínea</label>
            <input
              type="text"
              placeholder="Ej. LATAM, Sky"
              value={airlineName}
              onChange={(e) => setAirlineName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Salida Desde</label>
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Salida Hasta</label>
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="search-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearFilters}
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Alertas de reserva y errores */}
      {bookingMessage && (
        <div className="alert alert-success">
          <span>{bookingMessage}</span>
          {lastBookedId !== null && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => handleViewBookingDetail(lastBookedId)}
            >
              Ver detalle de reserva #{lastBookedId}
            </button>
          )}
        </div>
      )}

      {bookingError && <div className="alert alert-error">{bookingError}</div>}
      {searchError && <div className="alert alert-error">{searchError}</div>}

      {/* Modal/Tarjeta de Detalle de Reserva (Nice to Have) */}
      {selectedBookingDetail && (
        <div className="card detail-card">
          <div className="detail-header">
            <h3>Detalle de la Reserva #{selectedBookingDetail.id}</h3>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setSelectedBookingDetail(null)}
            >
              Cerrar
            </button>
          </div>
          <div className="detail-grid">
            <p><strong>Vuelo:</strong> {selectedBookingDetail.flightNumber}</p>
            <p><strong>Aerolínea:</strong> {selectedBookingDetail.airlineName}</p>
            <p>
              <strong>Pasajero:</strong> {selectedBookingDetail.customerFirstName}{' '}
              {selectedBookingDetail.customerLastName}
            </p>
            <p>
              <strong>Fecha de Reserva:</strong>{' '}
              {new Date(selectedBookingDetail.bookingDate).toLocaleString()}
            </p>
            <p>
              <strong>Salida:</strong>{' '}
              {new Date(selectedBookingDetail.estDepartureTime).toLocaleString()}
            </p>
            <p>
              <strong>Llegada:</strong>{' '}
              {new Date(selectedBookingDetail.estArrivalTime).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Tabla de Resultados */}
      <div className="card">
        <h3>Resultados ({flights.length})</h3>
        {loading ? (
          <p>Cargando vuelos...</p>
        ) : flights.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron vuelos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Vuelo</th>
                  <th>Aerolínea</th>
                  <th>Salida</th>
                  <th>Llegada</th>
                  <th>Asientos</th>
                  {user && <th>Acción</th>}
                </tr>
              </thead>
              <tbody>
                {flights.map((flight) => (
                  <tr key={flight.id}>
                    <td><strong>{flight.flightNumber}</strong></td>
                    <td>{flight.airlineName}</td>
                    <td>{new Date(flight.estDepartureTime).toLocaleString()}</td>
                    <td>{new Date(flight.estArrivalTime).toLocaleString()}</td>
                    <td>{flight.availableSeats}</td>
                    {user && (
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={
                            flight.availableSeats <= 0 ||
                            bookingInProgressId === flight.id
                          }
                          onClick={() => handleBookFlight(flight.id)}
                        >
                          {bookingInProgressId === flight.id
                            ? 'Reservando...'
                            : 'Reservar'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}