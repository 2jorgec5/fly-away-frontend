export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

export interface Flight {
  id: number;
  airlineName: string;
  flightNumber: string;
  estDepartureTime: string;
  estArrivalTime: string;
  availableSeats: number;
}

export interface FlightSearchResponse {
  items: Flight[];
}

export interface BookingDetail {
  id: number;
  bookingDate: string;
  flightId: number;
  flightNumber: string;
  airlineName: string;
  estDepartureTime: string;
  estArrivalTime: string;
  customerId: number;
  customerFirstName: string;
  customerLastName: string;
}