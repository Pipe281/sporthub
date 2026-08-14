import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FacilityService, FacilityWithType } from '../../../../core/services/facility.service';
import { ADMIN_ROUTES } from '../../../../core/constants/app-routes.constants';
import { FacilityDetailModalComponent } from '../../../../shared/ui/facility-detail-modal/facility-detail-modal.component';

@Component({
  selector: 'app-admin-facilities',
  standalone: true,
  imports: [RouterLink, FacilityDetailModalComponent],
  templateUrl: './admin-facilities.component.html',
})
export class AdminFacilitiesComponent implements OnInit {
  private readonly facilityService = inject(FacilityService);
  protected readonly ADMIN_ROUTES = ADMIN_ROUTES;
  readonly selectedFacilityId = signal<string | null>(null);

  readonly facilities = signal<FacilityWithType[]>([]);
  readonly searchTerm = signal('');
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
  openFacilityDetail(id: string): void {
    this.selectedFacilityId.set(id);
  }

  closeFacilityDetail(): void {
    this.selectedFacilityId.set(null);
  }
  onFacilityUpdated(updatedFacility: FacilityWithType): void {
    this.facilities.update((facilities) =>
      facilities.map((facility) =>
        facility.id === updatedFacility.id ? updatedFacility : facility,
      ),
    );
  }
  readonly filteredFacilities = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    if (!search) {
      return this.facilities();
    }

    return this.facilities().filter((facility) => facility.name.toLowerCase().includes(search));
  });
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
  }
}
