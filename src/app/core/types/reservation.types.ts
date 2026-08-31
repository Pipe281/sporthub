export interface OperatingHours {
  dayOfWeek: number;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
}

export interface TimeSlot {
  startAt: string;
  endAt: string;
}

export interface ReservationAvailability {
  id: string;
  startAt: string;
  endAt: string;
  status: 'PENDING' | 'CONFIRMED';
}

export interface FacilityAvailabilityResult {
  isClosed: boolean;
  unavailableReason: 'INACTIVE' | 'MAINTENANCE' | 'CLOSED' | null;
  slots: TimeSlot[];
}

export interface FacilityStatus {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}

export interface Reservation {
  id: string;
  customerId: string;
  facilityId: string;
  facilityName: string;
  startAt: string;
  endAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export interface AdminReservation extends Reservation {
  createdAt: string;
  customerName: string;
  customerEmail: string;
}
