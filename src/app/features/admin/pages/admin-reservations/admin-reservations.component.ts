import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { ReservationService } from '../../../../core/services/reservation.service';
import { Facility, FacilityService } from '../../../../core/services/facility.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SupabaseErrorMapper } from '../../../../core/services/supabase-error-mapper.service';
import type { AdminReservation } from '../../../../core/types/reservation.types';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-reservations.component.html',
})
export class AdminReservationsComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly facilityService = inject(FacilityService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorMapper = inject(SupabaseErrorMapper);

  readonly reservations = signal<AdminReservation[]>([]);
  readonly facilities = signal<Facility[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly selectedStatus = signal<AdminReservation['status'] | 'ALL'>('ALL');
  readonly selectedFacility = signal('ALL');
  readonly viewMode = signal<'list' | 'calendar'>('list');
  readonly calendarDate = signal(this.startOfMonth(new Date()));
  readonly currentPage = signal(1);
  readonly selectedReservation = signal<AdminReservation | null>(null);
  readonly reservationToCancel = signal<AdminReservation | null>(null);
  readonly cancellingReservationId = signal<string | null>(null);
  readonly cancellationError = signal<string | null>(null);
  readonly currentTime = signal(Date.now());
  readonly pageSize = 25;

  readonly facilityOptions = computed(() =>
    [...this.facilities()].sort((a, b) => a.name.localeCompare(b.name)),
  );

  readonly selectedFacilityName = computed(() => {
    const selectedFacility = this.selectedFacility();

    return selectedFacility === 'ALL'
      ? null
      : (this.facilities().find((facility) => facility.id === selectedFacility)?.name ?? null);
  });

  readonly filteredReservations = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const selectedStatus = this.selectedStatus();
    const selectedFacility = this.selectedFacility();

    return this.reservations().filter(
      (reservation) =>
        (selectedStatus === 'ALL' || reservation.status === selectedStatus) &&
        (selectedFacility === 'ALL' || reservation.facilityId === selectedFacility) &&
        (!term ||
          [reservation.customerName, reservation.customerEmail, reservation.facilityName]
            .join(' ')
            .toLowerCase()
            .includes(term)),
    );
  });

  readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('es-CL', {
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Santiago',
    }).format(this.calendarDate()),
  );

  readonly calendarDays = computed(() => {
    const month = this.calendarDate();
    const firstDay = this.startOfMonth(month);
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const totalDays = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    const today = this.toDateKey(new Date());

    return Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(month.getFullYear(), month.getMonth(), index - firstWeekday + 1);

      return {
        date,
        key: this.toDateKey(date),
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month.getMonth(),
        isToday: this.toDateKey(date) === today,
      };
    });
  });

  readonly selectedDateReservations = computed(() => {
    const selectedDate = this.selectedDate();

    return this.filteredReservations()
      .filter((reservation) => this.toDateKey(new Date(reservation.startAt)) === selectedDate)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  });

  readonly selectedDate = signal(this.toDateKey(new Date()));

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredReservations().length / this.pageSize)),
  );

  readonly displayedReservations = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;

    return this.filteredReservations().slice(start, start + this.pageSize);
  });

  readonly statusConfig = {
    PENDING: { label: 'Pendiente', classes: 'bg-yellow-500/10 text-yellow-400' },
    CONFIRMED: { label: 'Confirmada', classes: 'bg-[#9FEA00]/10 text-[#9FEA00]' },
    CANCELLED: { label: 'Cancelada', classes: 'bg-red-500/10 text-red-400' },
    COMPLETED: { label: 'Completada', classes: 'bg-blue-500/10 text-blue-400' },
  } as const;

  async ngOnInit(): Promise<void> {
    await this.loadReservations();
  }

  async loadReservations(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [reservations, facilities] = await Promise.all([
        this.reservationService.getAllReservations(),
        this.facilityService.getAllFacilities(),
      ]);
      this.reservations.set(reservations);
      this.facilities.set(facilities);
      this.currentPage.set(1);
    } catch (error) {
      console.error('Error al cargar las reservas administrativas:', error);
      this.error.set('No fue posible cargar las reservas. Intenta nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event): void {
    this.selectedStatus.set(
      (event.target as HTMLSelectElement).value as AdminReservation['status'] | 'ALL',
    );
    this.currentPage.set(1);
  }

  onFacilityChange(event: Event): void {
    this.selectedFacility.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  clearFacilityFilter(): void {
    this.selectedFacility.set('ALL');
    this.currentPage.set(1);
  }

  setViewMode(viewMode: 'list' | 'calendar'): void {
    this.viewMode.set(viewMode);
  }

  goToPreviousMonth(): void {
    const date = this.calendarDate();
    this.calendarDate.set(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  }

  goToNextMonth(): void {
    const date = this.calendarDate();
    this.calendarDate.set(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  }

  goToCurrentMonth(): void {
    const today = new Date();
    this.calendarDate.set(this.startOfMonth(today));
    this.selectedDate.set(this.toDateKey(today));
  }

  selectCalendarDate(dateKey: string): void {
    this.selectedDate.set(dateKey);
  }

  getReservationsForDate(dateKey: string): AdminReservation[] {
    return this.filteredReservations()
      .filter((reservation) => this.toDateKey(new Date(reservation.startAt)) === dateKey)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  goToPreviousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  canCancel(reservation: AdminReservation): boolean {
    const status = reservation.status;

    return status === 'PENDING' || status === 'CONFIRMED';
  }

  openDetails(reservation: AdminReservation): void {
    this.selectedReservation.set(reservation);
  }

  closeDetails(): void {
    this.selectedReservation.set(null);
  }

  requestCancellation(reservation: AdminReservation): void {
    if (!this.canCancel(reservation)) {
      return;
    }

    this.cancellationError.set(null);
    this.reservationToCancel.set(reservation);
  }

  dismissCancellation(): void {
    if (!this.cancellingReservationId()) {
      this.reservationToCancel.set(null);
      this.cancellationError.set(null);
    }
  }

  async confirmCancellation(): Promise<void> {
    const reservation = this.reservationToCancel();

    if (!reservation || this.cancellingReservationId()) {
      return;
    }

    this.cancellingReservationId.set(reservation.id);
    this.cancellationError.set(null);

    try {
      await this.reservationService.cancelReservationAsAdmin(reservation.id);
      this.reservations.update((items) =>
        items.map((item) =>
          item.id === reservation.id ? { ...item, status: 'CANCELLED' as const } : item,
        ),
      );
      this.currentPage.update((page) => Math.min(page, this.totalPages()));
      this.reservationToCancel.set(null);
      this.notificationService.success('La reserva fue cancelada correctamente.');
    } catch (error) {
      console.error('Error al cancelar la reserva como administrador:', error);
      this.cancellationError.set(this.errorMapper.mapReservationError(error));
    } finally {
      this.cancellingReservationId.set(null);
    }
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private toDateKey(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Santiago',
    }).format(date);
  }
}
