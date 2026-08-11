import { Component, inject, OnInit, signal, computed } from '@angular/core';

import {
  FacilityService,
  FacilityWithType,
  FacilityGroup,
} from '../../../../core/services/facility.service';

@Component({
  selector: 'app-facilities',
  standalone: true,
  imports: [],
  templateUrl: './facilities.component.html',
})
export class FacilitiesComponent implements OnInit {
  private readonly facilityService = inject(FacilityService);

  readonly facilities = signal<FacilityWithType[]>([]);
  readonly facilitiesByType = computed<FacilityGroup[]>(() => {
    const groups = new Map<string, FacilityWithType[]>();

    for (const facility of this.facilities()) {
      const type = facility.facility_types?.name ?? 'Otros';

      if (!groups.has(type)) {
        groups.set(type, []);
      }

      groups.get(type)!.push(facility);
    }

    return Array.from(groups.entries()).map(([type, facilities]) => ({
      type,
      facilities,
    }));
  });
  readonly loading = signal(true);
  readonly error = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(false);

      const facilities = await this.facilityService.getFacilities();

      console.log(
        'Instalaciones:',
        facilities.map((facility) => ({
          nombre: facility.name,
          tipo: facility.facility_types?.name,
        })),
      );

      this.facilities.set(facilities);
    } catch (error) {
      console.error('Error al cargar las instalaciones:', error);

      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
