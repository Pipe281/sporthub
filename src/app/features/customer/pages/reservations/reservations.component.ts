import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';

import { NotificationService } from '../../../../core/services/notification.service';
import { ReservationService } from '../../../../core/services/reservation.service';
import { SupabaseErrorMapper } from '../../../../core/services/supabase-error-mapper.service';
import type { Reservation } from '../../../../core/types/reservation.types';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './reservations.component.html',
})
export class ReservationsComponent implements OnDestroy, OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorMapper = inject(SupabaseErrorMapper);
  private completionTimer: ReturnType<typeof setInterval> | undefined;

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly cancellingReservationId = signal<string | null>(null);
  readonly reservationToCancel = signal<Reservation | null>(null);
  readonly cancellationError = signal<string | null>(null);
  readonly currentTime = signal(Date.now());
  readonly selectedStatus = signal<Reservation['status'] | 'ALL'>('ALL');
  readonly cancelledExpanded = signal(false);

  readonly filteredReservations = computed(() => {
    const selectedStatus = this.selectedStatus();

    return this.reservations().filter(
      (reservation) =>
        selectedStatus === 'ALL' || reservation.status === selectedStatus,
    );
  });

  readonly activeReservations = computed(() =>
    this.filteredReservations().filter(
      (reservation) => reservation.status !== 'CANCELLED',
    ),
  );

  readonly cancelledReservations = computed(() =>
    this.filteredReservations().filter(
      (reservation) => reservation.status === 'CANCELLED',
    ),
  );

  readonly displayedReservations = this.activeReservations;
  readonly statusConfig = {
    PENDING: {
      label: 'Pendiente',
      classes: 'bg-yellow-500/10 text-yellow-400',
    },
    CONFIRMED: {
      label: 'Confirmada',
      classes: 'bg-[#9FEA00]/10 text-[#9FEA00]',
    },
    CANCELLED: {
      label: 'Cancelada',
      classes: 'bg-red-500/10 text-red-400',
    },
    COMPLETED: {
      label: 'Completada',
      classes: 'bg-blue-500/10 text-blue-400',
    },
  } as const;

  ngOnInit(): void {
    this.loadReservations();
    this.completionTimer = setInterval(() => this.currentTime.set(Date.now()), 60_000);
  }

  ngOnDestroy(): void {
    if (this.completionTimer) {
      clearInterval(this.completionTimer);
    }
  }

  onStatusChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value as Reservation['status'] | 'ALL';

    this.selectedStatus.set(status);

    if (status === 'CANCELLED') {
      this.cancelledExpanded.set(true);
    }
  }

  toggleCancelledReservations(): void {
    this.cancelledExpanded.update((expanded) => !expanded);
  }

  async loadReservations(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const reservations = await this.reservationService.getMyReservations();

      this.reservations.set(reservations);
    } catch (error) {
      console.error('Error al cargar las reservas:', error);

      this.error.set('No fue posible cargar tus reservas. Intenta nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }

  canCancel(reservation: Reservation): boolean {
    return (
      reservation.status === 'CONFIRMED' &&
      this.getCancellationDeadline(reservation).getTime() >= this.currentTime()
    );
  }

  getCancellationDeadline(reservation: Reservation): Date {
    return new Date(new Date(reservation.startAt).getTime() - 2 * 60 * 60 * 1000);
  }

  requestCancellation(reservation: Reservation): void {
    if (!this.canCancel(reservation)) {
      return;
    }

    this.cancellationError.set(null);
    this.reservationToCancel.set(reservation);
  }

  dismissCancellation(): void {
    if (this.cancellingReservationId()) {
      return;
    }

    this.reservationToCancel.set(null);
    this.cancellationError.set(null);
  }

  async confirmCancellation(): Promise<void> {
    const reservation = this.reservationToCancel();

    if (!reservation || this.cancellingReservationId()) {
      return;
    }

    this.cancellingReservationId.set(reservation.id);
    this.cancellationError.set(null);

    try {
      await this.reservationService.cancelMyReservation(reservation.id);

      this.reservations.update((reservations) =>
        reservations.map((item) =>
          item.id === reservation.id ? { ...item, status: 'CANCELLED' } : item,
        ),
      );
      this.reservationToCancel.set(null);
      this.notificationService.success('La reserva fue cancelada correctamente.');
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      this.cancellationError.set(this.errorMapper.mapReservationError(error));
    } finally {
      this.cancellingReservationId.set(null);
    }
  }
}
