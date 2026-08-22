import { DatePipe, registerLocaleData } from '@angular/common';
import { Router } from '@angular/router';
import localeEs from '@angular/common/locales/es';
import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';

import { CUSTOMER_ROUTES } from '../../../core/constants/app-routes.constants';
import { ReservationService, TimeSlot } from '../../../core/services/reservation.service';

registerLocaleData(localeEs);

interface CalendarDay {
  date: Date;
  currentMonth: boolean;
}

@Component({
  selector: 'app-reservation-form-modal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './reservation-form-modal.component.html',
})
export class ReservationFormModalComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly reservationService = inject(ReservationService);

  readonly facilityId = input.required<string>();
  readonly closed = output<void>();

  readonly facilityName = signal<string | null>(null);
  readonly loadingFacility = signal(true);

  readonly currentStep = signal(1);

  readonly selectedDate = signal<Date | null>(null);
  readonly selectedTimeSlot = signal<TimeSlot | null>(null);
  readonly selectedDuration = signal<1 | 2>(1);

  readonly currentMonth = signal(new Date());

  readonly timeSlots = signal<TimeSlot[]>([]);
  readonly loadingSlots = signal(false);
  readonly slotsError = signal(false);
  readonly unavailableReason = signal<'INACTIVE' | 'MAINTENANCE' | 'CLOSED' | null>(null);

  readonly creatingReservation = signal(false);
  readonly reservationError = signal<string | null>(null);
  readonly reservationSuccess = signal(false);

  readonly calendarDays = computed<CalendarDay[]>(() => {
    const month = this.currentMonth();

    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: CalendarDay[] = [];

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, monthIndex, -i),
        currentMonth: false,
      });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        date: new Date(year, monthIndex, day),
        currentMonth: true,
      });
    }

    const remainingDays = (7 - (days.length % 7)) % 7;

    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, monthIndex + 1, day),
        currentMonth: false,
      });
    }

    return days;
  });

  ngOnInit(): void {
    this.loadFacility();
  }

  close(): void {
    this.closed.emit();
  }

  async loadFacility(): Promise<void> {
    try {
      this.loadingFacility.set(true);

      const facility = await this.reservationService.getFacilityStatus(this.facilityId());

      this.facilityName.set(facility?.name ?? null);
    } catch (error) {
      console.error('Error al cargar la instalación:', error);

      this.facilityName.set(null);
    } finally {
      this.loadingFacility.set(false);
    }
  }

  selectDate(date: Date): void {
    if (!this.isDateSelectable(date)) {
      return;
    }

    this.selectedDate.set(date);
    this.selectedTimeSlot.set(null);

    this.timeSlots.set([]);
    this.slotsError.set(false);
    this.unavailableReason.set(null);
    this.reservationError.set(null);
    this.reservationSuccess.set(false);

    this.currentStep.set(2);
  }

  selectTimeSlot(slot: TimeSlot): void {
    this.selectedTimeSlot.set(slot);
    this.reservationError.set(null);
  }

  goToDateStep(): void {
    this.selectedTimeSlot.set(null);

    this.timeSlots.set([]);
    this.slotsError.set(false);
    this.unavailableReason.set(null);
    this.reservationError.set(null);
    this.reservationSuccess.set(false);

    this.currentStep.set(1);
  }

  goToTimeStep(): void {
    this.reservationError.set(
      'El horario seleccionado ya no está disponible. Por favor, selecciona otro horario.',
    );
    this.reservationSuccess.set(false);

    this.currentStep.set(3);
  }

  goToConfirmationStep(): void {
    if (!this.selectedDate() || !this.selectedTimeSlot()) {
      return;
    }

    this.reservationError.set(null);
    this.reservationSuccess.set(false);

    this.currentStep.set(4);
  }

  async loadTimeSlots(date: Date): Promise<void> {
    try {
      this.loadingSlots.set(true);
      this.slotsError.set(false);
      this.timeSlots.set([]);
      this.unavailableReason.set(null);

      const result = await this.reservationService.getAvailableSlotsForDate(
        this.facilityId(),
        date,
        this.selectedDuration(),
      );

      this.unavailableReason.set(result.unavailableReason);
      this.timeSlots.set(result.slots);
    } catch (error) {
      console.error('Error al cargar horarios:', error);

      this.slotsError.set(true);
    } finally {
      this.loadingSlots.set(false);
    }
  }

  async confirmReservation(): Promise<void> {
    const date = this.selectedDate();
    const timeSlot = this.selectedTimeSlot();

    if (!date || !timeSlot) {
      return;
    }

    try {
      this.creatingReservation.set(true);
      this.reservationError.set(null);

      await this.reservationService.createReservation(this.facilityId(), date, timeSlot);

      this.reservationSuccess.set(true);
    } catch (error: unknown) {
      console.error('Error al crear la reserva:', error);

      if (
        error instanceof Error &&
        error.message.includes('RESERVATION_TIME_IS_NO_LONGER_AVAILABLE')
      ) {
        this.reservationError.set(
          'El horario seleccionado ya no está disponible. Por favor, selecciona otro horario.',
        );

        this.currentStep.set(3);
      } else {
        this.reservationError.set('No fue posible crear la reserva. Inténtalo nuevamente.');
      }
    } finally {
      this.creatingReservation.set(false);
    }
  }

  isDateSelectable(date: Date): boolean {
    const today = this.startOfDay(new Date());
    const selectedDate = this.startOfDay(date);

    const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    return selectedDate >= today && selectedDate <= maxDate;
  }

  isToday(date: Date): boolean {
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  selectDuration(duration: 1 | 2): void {
    this.selectedDuration.set(duration);

    this.selectedTimeSlot.set(null);
    this.reservationError.set(null);
    this.reservationSuccess.set(false);

    const date = this.selectedDate();

    if (!date) {
      return;
    }

    this.currentStep.set(3);

    void this.loadTimeSlots(date);
  }
  goToDurationStep(): void {
    this.selectedTimeSlot.set(null);
    this.reservationError.set(null);
    this.reservationSuccess.set(false);

    this.currentStep.set(2);
  }
  goToMyReservations(): void {
    this.close();
    void this.router.navigateByUrl(CUSTOMER_ROUTES.RESERVATIONS);
  }
}
