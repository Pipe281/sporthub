import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';

import { Reservation, ReservationService } from '../../../../core/services/reservation.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './reservations.component.html',
})
export class ReservationsComponent implements OnDestroy, OnInit {
  private readonly reservationService = inject(ReservationService);
  private completionTimer: ReturnType<typeof setInterval> | undefined;

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly cancellingReservationId = signal<string | null>(null);
  readonly reservationToCancel = signal<Reservation | null>(null);
  readonly cancellationError = signal<string | null>(null);
  readonly cancellationSuccess = signal<string | null>(null);
  readonly currentTime = signal(Date.now());
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
      this.getDisplayStatus(reservation) === 'CONFIRMED' &&
      this.getCancellationDeadline(reservation).getTime() >= this.currentTime()
    );
  }

  getDisplayStatus(reservation: Reservation): Reservation['status'] {
    if (
      reservation.status === 'CONFIRMED' &&
      new Date(reservation.endAt).getTime() <= this.currentTime()
    ) {
      return 'COMPLETED';
    }

    return reservation.status;
  }

  getCancellationDeadline(reservation: Reservation): Date {
    return new Date(new Date(reservation.startAt).getTime() - 2 * 60 * 60 * 1000);
  }

  requestCancellation(reservation: Reservation): void {
    if (!this.canCancel(reservation)) {
      return;
    }

    this.cancellationError.set(null);
    this.cancellationSuccess.set(null);
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
      this.cancellationSuccess.set('La reserva fue cancelada correctamente.');
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      this.cancellationError.set(this.mapCancellationError(error));
    } finally {
      this.cancellingReservationId.set(null);
    }
  }

  private mapCancellationError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    const normalizedMessage = message.toUpperCase();

    if (
      normalizedMessage.includes('CANCELLATION_TOO_LATE') ||
      normalizedMessage.includes('TWO_HOURS') ||
      normalizedMessage.includes('MINIMUM_CANCELLATION')
    ) {
      return 'La reserva ya no puede cancelarse porque faltan menos de 2 horas para su inicio.';
    }

    if (normalizedMessage.includes('NOT_CONFIRMED')) {
      return 'Solo puedes cancelar reservas confirmadas.';
    }

    if (normalizedMessage.includes('NOT_FOUND') || normalizedMessage.includes('NOT_OWNER')) {
      return 'No fue posible encontrar una reserva cancelable.';
    }

    return 'No fue posible cancelar la reserva. Inténtalo nuevamente.';
  }
}
