import { Component, inject, OnInit, signal, computed } from '@angular/core';
import {
  FacilityService,
  FacilityWithType,
  FacilityGroup,
} from '../../../../core/services/facility.service';
import { ReservationFormModalComponent } from '../../../../shared/ui/reservation-form-modal/reservation-form-modal.component';
@Component({
  selector: 'app-facilities',
  standalone: true,
  imports: [ReservationFormModalComponent],
  templateUrl: './facilities.component.html',
})
export class FacilitiesComponent implements OnInit {
  private readonly facilityService = inject(FacilityService);

  readonly selectedFacilityId = signal<string | null>(null);
  readonly reservationModalOpen = signal(false);

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
  openReservationModal(facilityId: string): void {
    this.selectedFacilityId.set(facilityId);
    this.reservationModalOpen.set(true);
  }

  closeReservationModal(): void {
    this.reservationModalOpen.set(false);
    this.selectedFacilityId.set(null);
  }
}
