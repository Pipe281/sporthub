import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { CustomerService } from '../../../../core/services/customer.service';
import { FacilityService } from '../../../../core/services/facility.service';
import {
  AdminReservation,
  ReservationService,
} from '../../../../core/services/reservation.service';

export interface AdminMetrics {
  todayReservations: number;
  monthReservations: number;
  customers: number;
  activeFacilities: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly facilityService = inject(FacilityService);
  private readonly reservationService = inject(ReservationService);

  readonly metrics = signal<AdminMetrics | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly recentReservations = signal<AdminReservation[]>([]);
  readonly selectedReservation = signal<AdminReservation | null>(null);

  readonly statusConfig = {
    PENDING: { label: 'Pendiente', classes: 'bg-yellow-500/10 text-yellow-400' },
    CONFIRMED: { label: 'Confirmada', classes: 'bg-[#9FEA00]/10 text-[#9FEA00]' },
    CANCELLED: { label: 'Cancelada', classes: 'bg-red-500/10 text-red-400' },
    COMPLETED: { label: 'Completada', classes: 'bg-blue-500/10 text-blue-400' },
  } as const;

  async ngOnInit(): Promise<void> {
    await this.loadMetrics();
  }

  async loadMetrics(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);

    try {
      const [
        todayReservations,
        monthReservations,
        customers,
        activeFacilities,
        recentReservations,
      ] = await Promise.all([
        this.reservationService.getReservationCountForToday(),
        this.reservationService.getReservationCountForCurrentMonth(),
        this.customerService.getCustomerCount(),
        this.facilityService.getActiveFacilityCount(),
        this.reservationService.getRecentReservations(),
      ]);

      this.metrics.set({ todayReservations, monthReservations, customers, activeFacilities });
      this.recentReservations.set(recentReservations);
    } catch (error) {
      console.error('Error al cargar las métricas del dashboard:', error);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  openReservationDetails(reservation: AdminReservation): void {
    this.selectedReservation.set(reservation);
  }

  closeReservationDetails(): void {
    this.selectedReservation.set(null);
  }
}
