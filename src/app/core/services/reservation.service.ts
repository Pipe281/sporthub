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
  facilityName: string;
  startAt: string;
  endAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly businessTimeZone = 'America/Santiago';
  private readonly supabaseService = inject(SupabaseService);
  private readonly supabase = this.supabaseService.getClient();

  async getOperatingHours(date: Date): Promise<OperatingHours | null> {
    const dayOfWeek = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    ).getUTCDay();

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
    durationHours: 1 | 2 = 1,
  ): Promise<FacilityAvailabilityResult> {
    // 1. Verificar estado de la instalación
    const facility = await this.getFacilityStatus(facilityId);

    if (!facility || facility.status === 'INACTIVE') {
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

    // 2. Obtener horario de funcionamiento
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

    // 3. Generar horarios según duración seleccionada
    const slots = this.generateTimeSlots(
      operatingHours.opensAt,
      operatingHours.closesAt,
      durationHours,
    );

    const startAt = this.toBusinessTimeIso(date, operatingHours.opensAt);
    const endAt = this.toBusinessTimeIso(date, operatingHours.closesAt);

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
    const [startHour, startMinute] = timeSlot.startAt.split(':').map(Number);

    const [endHour, endMinute] = timeSlot.endAt.split(':').map(Number);

    const startAt = this.toBusinessTimeIso(date, `${startHour}:${startMinute}`);
    const endAt = this.toBusinessTimeIso(date, `${endHour}:${endMinute}`);

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
      facilityName: '',
      startAt: data.start_at,
      endAt: data.end_at,
      status: data.status,
    };
  }

  generateTimeSlots(opensAt: string, closesAt: string, durationHours: 1 | 2): TimeSlot[] {
    const slots: TimeSlot[] = [];

    const [openHour, openMinute] = opensAt.split(':').map(Number);

    const [closeHour, closeMinute] = closesAt.split(':').map(Number);

    let currentMinutes = openHour * 60 + openMinute;

    const closingMinutes = closeHour * 60 + closeMinute;

    const durationMinutes = durationHours * 60;

    while (currentMinutes < closingMinutes) {
      const endMinutes = currentMinutes + durationMinutes;

      if (endMinutes > closingMinutes) {
        break;
      }

      slots.push({
        startAt: this.minutesToTime(currentMinutes),
        endAt: this.minutesToTime(endMinutes),
      });

      // Los horarios comienzan cada 1 hora
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

    return slots.filter((slot) => this.toBusinessTimeIso(date, slot.startAt) > now.toISOString());
  }

  private extractTime(dateTime: string): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.businessTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(dateTime));

    const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
    const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';

    return `${hour}:${minute}`;
  }

  private toBusinessTimeIso(date: Date, time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const candidate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0),
    );
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.businessTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(candidate);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const displayedAsUtc = Date.UTC(
      Number(values['year']),
      Number(values['month']) - 1,
      Number(values['day']),
      Number(values['hour']),
      Number(values['minute']),
      Number(values['second']),
    );
    const offset = displayedAsUtc - candidate.getTime();

    return new Date(candidate.getTime() - offset).toISOString();
  }

  private minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  async getMyReservations(): Promise<Reservation[]> {
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error('No hay un usuario autenticado.');
    }

    const { data, error } = await this.supabase
      .from('reservations')
      .select(
        `
    id,
    customer_id,
    facility_id,
    start_at,
    end_at,
    status,
    facilities (
      name
    )
  `,
      )
      .eq('customer_id', user.id)
      .order('start_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((reservation) => {
      const facility = reservation.facilities as unknown as { name: string } | null;

      return {
        id: reservation.id,
        customerId: reservation.customer_id,
        facilityId: reservation.facility_id,
        facilityName: facility?.name ?? 'Instalación no disponible',
        startAt: reservation.start_at,
        endAt: reservation.end_at,
        status: reservation.status,
      };
    });
  }

  async cancelMyReservation(reservationId: string): Promise<void> {
    const { error } = await this.supabase.rpc('cancel_my_reservation', {
      p_reservation_id: reservationId,
    });

    if (error) {
      throw error;
    }
  }
}
