import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import {
  AdminReservation,
  ReservationService,
} from '../../../../core/services/reservation.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-reservations.component.html',
})
export class AdminReservationsComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly notificationService = inject(NotificationService);

  readonly reservations = signal<AdminReservation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly selectedReservation = signal<AdminReservation | null>(null);
  readonly reservationToCancel = signal<AdminReservation | null>(null);
  readonly cancellingReservationId = signal<string | null>(null);
  readonly cancellationError = signal<string | null>(null);
  readonly currentTime = signal(Date.now());

  readonly filteredReservations = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.reservations();
    }

    return this.reservations().filter((reservation) =>
      [reservation.customerName, reservation.customerEmail, reservation.facilityName]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
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
      this.reservations.set(await this.reservationService.getAllReservations());
    } catch (error) {
      console.error('Error al cargar las reservas administrativas:', error);
      this.error.set('No fue posible cargar las reservas. Intenta nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  getDisplayStatus(reservation: AdminReservation): AdminReservation['status'] {
    if (
      reservation.status === 'CONFIRMED' &&
      new Date(reservation.endAt).getTime() <= this.currentTime()
    ) {
      return 'COMPLETED';
    }

    return reservation.status;
  }

  canCancel(reservation: AdminReservation): boolean {
    const status = this.getDisplayStatus(reservation);

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
      this.reservationToCancel.set(null);
      this.notificationService.success('La reserva fue cancelada correctamente.');
    } catch (error) {
      console.error('Error al cancelar la reserva como administrador:', error);
      this.cancellationError.set('No fue posible cancelar la reserva. Inténtalo nuevamente.');
    } finally {
      this.cancellingReservationId.set(null);
    }
  }
}
