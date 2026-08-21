import { Injectable, inject } from '@angular/core';

import { SupabaseService } from './supabase.service';

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
  startAt: string;
  endAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly supabase = this.supabaseService.getClient();

  async getOperatingHours(date: Date): Promise<OperatingHours | null> {
    const dayOfWeek = date.getDay();

    const { data, error } = await this.supabase
      .from('operating_hours')
      .select('day_of_week, is_closed, opens_at, closes_at')
      .eq('day_of_week', dayOfWeek)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      dayOfWeek: data.day_of_week,
      isClosed: data.is_closed,
      opensAt: data.opens_at,
      closesAt: data.closes_at,
    };
  }

  async getFacilityStatus(facilityId: string): Promise<FacilityStatus | null> {
    const { data, error } = await this.supabase
      .from('facilities')
      .select('id, name, status')
      .eq('id', facilityId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getFacilityAvailability(
    facilityId: string,
    startAt: string,
    endAt: string,
  ): Promise<ReservationAvailability[]> {
    const { data, error } = await this.supabase.rpc('get_facility_availability', {
      p_facility_id: facilityId,
      p_start_at: startAt,
      p_end_at: endAt,
    });

    if (error) {
      throw error;
    }

    console.log('Disponibilidad recibida:', data);

    return (data ?? []).map(
      (reservation: {
        id: string;
        start_at: string;
        end_at: string;
        status: 'PENDING' | 'CONFIRMED';
      }) => ({
        id: reservation.id,
        startAt: this.extractTime(reservation.start_at),
        endAt: this.extractTime(reservation.end_at),
        status: reservation.status,
      }),
    );
  }

  async getAvailableSlotsForDate(
    facilityId: string,
    date: Date,
  ): Promise<FacilityAvailabilityResult> {
    // 1. Verificar estado de la instalación
    const facility = await this.getFacilityStatus(facilityId);

    if (!facility) {
      return {
        isClosed: true,
        unavailableReason: 'INACTIVE',
        slots: [],
      };
    }

    if (facility.status === 'INACTIVE') {
      return {
        isClosed: true,
        unavailableReason: 'INACTIVE',
        slots: [],
      };
    }

    if (facility.status === 'MAINTENANCE') {
      return {
        isClosed: true,
        unavailableReason: 'MAINTENANCE',
        slots: [],
      };
    }

    // 2. Verificar horario de funcionamiento
    const operatingHours = await this.getOperatingHours(date);

    if (
      !operatingHours ||
      operatingHours.isClosed ||
      !operatingHours.opensAt ||
      !operatingHours.closesAt
    ) {
      return {
        isClosed: true,
        unavailableReason: 'CLOSED',
        slots: [],
      };
    }

    // 3. Generar bloques de 1 hora
    const slots = this.generateTimeSlots(operatingHours.opensAt, operatingHours.closesAt);

    const formattedDate = this.formatDate(date);

    const startAt = `${formattedDate}T${operatingHours.opensAt}`;
    const endAt = `${formattedDate}T${operatingHours.closesAt}`;

    // 4. Obtener reservas existentes
    const reservations = await this.getFacilityAvailability(facilityId, startAt, endAt);

    // 5. Eliminar horarios ocupados
    const availableSlots = this.getAvailableSlots(slots, reservations);

    // 6. Eliminar horarios que ya pasaron
    const filteredSlots = this.filterPastSlots(availableSlots, date);

    return {
      isClosed: false,
      unavailableReason: null,
      slots: filteredSlots,
    };
  }

  async createReservation(
    facilityId: string,
    date: Date,
    timeSlot: TimeSlot,
  ): Promise<Reservation> {
    const formattedDate = this.formatDate(date);

    const startAt = `${formattedDate}T${timeSlot.startAt}:00`;
    const endAt = `${formattedDate}T${timeSlot.endAt}:00`;

    const { data, error } = await this.supabase.rpc('create_reservation', {
      p_facility_id: facilityId,
      p_start_at: startAt,
      p_end_at: endAt,
    });

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      customerId: data.customer_id,
      facilityId: data.facility_id,
      startAt: data.start_at,
      endAt: data.end_at,
      status: data.status,
    };
  }

  generateTimeSlots(opensAt: string, closesAt: string): TimeSlot[] {
    const slots: TimeSlot[] = [];

    const [openHour, openMinute] = opensAt.split(':').map(Number);

    const [closeHour, closeMinute] = closesAt.split(':').map(Number);

    let currentMinutes = openHour * 60 + openMinute;

    const closingMinutes = closeHour * 60 + closeMinute;

    while (currentMinutes < closingMinutes) {
      const endMinutes = currentMinutes + 60;

      if (endMinutes > closingMinutes) {
        break;
      }

      slots.push({
        startAt: this.minutesToTime(currentMinutes),
        endAt: this.minutesToTime(endMinutes),
      });

      currentMinutes += 60;
    }

    return slots;
  }

  getAvailableSlots(slots: TimeSlot[], reservations: ReservationAvailability[]): TimeSlot[] {
    return slots.filter((slot) => {
      return !reservations.some((reservation) => {
        return slot.startAt < reservation.endAt && slot.endAt > reservation.startAt;
      });
    });
  }

  private filterPastSlots(slots: TimeSlot[], date: Date): TimeSlot[] {
    const now = new Date();

    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (!isToday) {
      return slots;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return slots.filter((slot) => {
      const [hour, minute] = slot.startAt.split(':').map(Number);

      const slotStartMinutes = hour * 60 + minute;

      return slotStartMinutes > currentMinutes;
    });
  }

  private extractTime(dateTime: string): string {
    return dateTime.substring(11, 16);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
