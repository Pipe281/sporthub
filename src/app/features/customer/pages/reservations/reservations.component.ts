import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { Reservation, ReservationService } from '../../../../core/services/reservation.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './reservations.component.html',
})
export class ReservationsComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
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
}
