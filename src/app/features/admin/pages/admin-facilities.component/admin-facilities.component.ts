import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FacilityService, FacilityWithType } from '../../../../core/services/facility.service';
import { ADMIN_ROUTES } from '../../../../core/constants/app-routes.constants';

@Component({
  selector: 'app-admin-facilities',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-facilities.component.html',
})
export class AdminFacilitiesComponent implements OnInit {
  private readonly facilityService = inject(FacilityService);
  protected readonly ADMIN_ROUTES = ADMIN_ROUTES;

  readonly facilities = signal<FacilityWithType[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(false);

      const facilities = await this.facilityService.getAllFacilities();

      this.facilities.set(facilities);
    } catch (error) {
      console.error('Error al cargar las instalaciones:', error);

      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
