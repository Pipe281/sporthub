import { Component, OnInit, inject, signal } from '@angular/core';

import { CustomerService } from '../../../../core/services/customer.service';
import { FacilityService } from '../../../../core/services/facility.service';
import { ReservationService } from '../../../../core/services/reservation.service';

export interface AdminMetrics {
  todayReservations: number;
  monthReservations: number;
  customers: number;
  activeFacilities: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
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

  async ngOnInit(): Promise<void> {
    await this.loadMetrics();
  }

  async loadMetrics(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);

    try {
      const [todayReservations, monthReservations, customers, activeFacilities] = await Promise.all(
        [
          this.reservationService.getReservationCountForToday(),
          this.reservationService.getReservationCountForCurrentMonth(),
          this.customerService.getCustomerCount(),
          this.facilityService.getActiveFacilityCount(),
        ],
      );

      this.metrics.set({ todayReservations, monthReservations, customers, activeFacilities });
    } catch (error) {
      console.error('Error al cargar las métricas del dashboard:', error);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
